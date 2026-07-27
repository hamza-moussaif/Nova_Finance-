import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useRecurringTransactions() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("recurring_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setTemplates(data ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  async function addTemplate({ name, amount, type, category, frequency, startDate }) {
    const { data, error } = await supabase
      .from("recurring_transactions")
      .insert({
        user_id: user.id,
        name,
        amount,
        type,
        category,
        frequency,
        start_date: startDate,
      })
      .select()
      .single();

    if (error) throw error;
    setTemplates((prev) => [data, ...prev]);
    return data;
  }

  async function toggleActive(id, active) {
    const { error } = await supabase
      .from("recurring_transactions")
      .update({ active })
      .eq("id", id);
    if (error) throw error;
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, active } : t)));
  }

  async function deleteTemplate(id) {
    const { error } = await supabase.from("recurring_transactions").delete().eq("id", id);
    if (error) throw error;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  return { templates, loading, error, addTemplate, toggleActive, deleteTemplate, refetch: fetchTemplates };
}
