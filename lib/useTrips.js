import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [spentByTrip, setSpentByTrip] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrips = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    const [{ data: tripRows, error: tripsError }, { data: expenseRows, error: expensesError }] =
      await Promise.all([
        supabase
          .from("trips")
          .select("*")
          .eq("user_id", user.id)
          .order("start_date", { ascending: true, nullsFirst: false }),
        supabase.from("trip_expenses").select("trip_id, amount").eq("user_id", user.id),
      ]);

    if (tripsError || expensesError) {
      setError((tripsError || expensesError).message);
    } else {
      setTrips(tripRows ?? []);
      const totals = {};
      for (const row of expenseRows ?? []) {
        totals[row.trip_id] = (totals[row.trip_id] || 0) + Number(row.amount);
      }
      setSpentByTrip(totals);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  async function addTrip({ name, destination, startDate, endDate, budgetAmount, currency }) {
    const { data, error } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        name,
        destination,
        start_date: startDate || null,
        end_date: endDate || null,
        budget_amount: budgetAmount,
        currency,
      })
      .select()
      .single();

    if (error) throw error;
    setTrips((prev) => [...prev, data]);
    return data;
  }

  async function deleteTrip(id) {
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) throw error;
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }

  return { trips, spentByTrip, loading, error, addTrip, deleteTrip, refetch: fetchTrips };
}
