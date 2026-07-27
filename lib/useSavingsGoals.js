import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useSavingsGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setGoals(data ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  async function addGoal({ name, targetAmount, deadline }) {
    const { data, error } = await supabase
      .from("savings_goals")
      .insert({
        user_id: user.id,
        name,
        target_amount: targetAmount,
        deadline: deadline || null,
      })
      .select()
      .single();

    if (error) throw error;
    setGoals((prev) => [data, ...prev]);
    return data;
  }

  async function contribute(id, amount) {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const nextAmount = Math.max(0, Number(goal.current_amount) + amount);

    const { data, error } = await supabase
      .from("savings_goals")
      .update({ current_amount: nextAmount })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    setGoals((prev) => prev.map((g) => (g.id === id ? data : g)));
  }

  async function deleteGoal(id) {
    const { error } = await supabase.from("savings_goals").delete().eq("id", id);
    if (error) throw error;
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  return { goals, loading, error, addGoal, contribute, deleteGoal, refetch: fetchGoals };
}
