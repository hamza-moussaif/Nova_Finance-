import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setTransactions(data ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  async function addTransaction({ name, amount, type, category, date }) {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        name,
        amount,
        type,
        category,
        date,
      })
      .select()
      .single();

    if (error) throw error;
    setTransactions((prev) => [data, ...prev]);
    return data;
  }

  async function deleteTransaction(id) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  return {
    transactions,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}
