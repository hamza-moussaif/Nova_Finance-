import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { addInterval } from "./recurringEngine";

const RECURRING_LOOKAHEAD_DAYS = 3;
const DEADLINE_LOOKAHEAD_DAYS = 7;
const TRIP_LOOKAHEAD_DAYS = 7;

function daysBetween(from, to) {
  const ms = new Date(to).setHours(0, 0, 0, 0) - new Date(from).setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function useNotifications() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const today = new Date();

      const [{ data: transactions }, { data: goals }, { data: recurring }, { data: trips }] =
        await Promise.all([
          supabase.from("transactions").select("date, type, category, amount").eq("user_id", user.id),
          supabase.from("savings_goals").select("id, name, target_amount, current_amount, deadline").eq("user_id", user.id),
          supabase.from("recurring_transactions").select("*").eq("user_id", user.id).eq("active", true),
          supabase.from("trips").select("id, name, start_date").eq("user_id", user.id),
        ]);

      if (cancelled) return;

      const items = [];

      // Budget overruns for the current month.
      const budgetAllocation = profile.budget_allocation || {};
      const hasBudget = Object.keys(budgetAllocation).length > 0;
      if (hasBudget && transactions) {
        let monthlyIncome = 0;
        const monthlyExpensesByCategory = {};
        for (const t of transactions) {
          if (!isThisMonth(t.date)) continue;
          if (t.type === "income") monthlyIncome += Number(t.amount);
          else monthlyExpensesByCategory[t.category] = (monthlyExpensesByCategory[t.category] || 0) + Number(t.amount);
        }
        for (const [category, percent] of Object.entries(budgetAllocation)) {
          const allocated = (monthlyIncome * percent) / 100;
          const spent = monthlyExpensesByCategory[category] || 0;
          if (allocated > 0 && spent > allocated) {
            items.push({
              id: `budget-${category}`,
              type: "budget",
              severity: "warning",
              href: "/budgets",
              data: { category, over: spent - allocated },
            });
          }
        }
      }

      // Savings goal deadlines.
      for (const goal of goals ?? []) {
        if (!goal.deadline || Number(goal.current_amount) >= Number(goal.target_amount)) continue;
        const days = daysBetween(today, goal.deadline);
        if (days < 0) {
          items.push({ id: `goal-${goal.id}`, type: "goalOverdue", severity: "warning", href: "/goals", data: { name: goal.name } });
        } else if (days <= DEADLINE_LOOKAHEAD_DAYS) {
          items.push({ id: `goal-${goal.id}`, type: "goalDeadline", severity: "info", href: "/goals", data: { name: goal.name, days } });
        }
      }

      // Recurring transactions due soon.
      for (const tpl of recurring ?? []) {
        const nextDue = tpl.last_generated_date
          ? addInterval(new Date(tpl.last_generated_date), tpl.frequency)
          : new Date(tpl.start_date);
        const days = daysBetween(today, nextDue);
        if (days >= 0 && days <= RECURRING_LOOKAHEAD_DAYS) {
          items.push({ id: `recurring-${tpl.id}`, type: "recurringDue", severity: "info", href: "/recurring", data: { name: tpl.name, days } });
        }
      }

      // Upcoming trips.
      for (const trip of trips ?? []) {
        if (!trip.start_date) continue;
        const days = daysBetween(today, trip.start_date);
        if (days >= 0 && days <= TRIP_LOOKAHEAD_DAYS) {
          items.push({ id: `trip-${trip.id}`, type: "tripUpcoming", severity: "info", href: `/trips/${trip.id}`, data: { name: trip.name, days } });
        }
      }

      setNotifications(items);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, profile.budget_allocation]);

  return { notifications, loading };
}
