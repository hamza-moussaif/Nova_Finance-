import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useBudgets() {
  const { user } = useAuth();
  const [budgetAllocation, setBudgetAllocation] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBudgets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("profiles")
      .select("budget_allocation")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      setError(error.message);
    } else {
      setBudgetAllocation(data?.budget_allocation ?? {});
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  async function saveBudgets(allocation) {
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, budget_allocation: allocation });

    if (error) throw error;
    setBudgetAllocation(allocation);
  }

  return { budgetAllocation, loading, error, saveBudgets, refetch: fetchBudgets };
}
