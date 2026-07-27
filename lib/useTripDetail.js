import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useTripDetail(tripId) {
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    if (!user || !tripId) return;
    setLoading(true);
    setError("");

    const [tripRes, expensesRes, itineraryRes, checklistRes] = await Promise.all([
      supabase.from("trips").select("*").eq("id", tripId).eq("user_id", user.id).maybeSingle(),
      supabase
        .from("trip_expenses")
        .select("*")
        .eq("trip_id", tripId)
        .order("date", { ascending: false }),
      supabase
        .from("trip_itinerary_items")
        .select("*")
        .eq("trip_id", tripId)
        .order("item_date", { ascending: true })
        .order("item_time", { ascending: true }),
      supabase
        .from("trip_checklist_items")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true }),
    ]);

    const firstError = tripRes.error || expensesRes.error || itineraryRes.error || checklistRes.error;
    if (firstError) {
      setError(firstError.message);
    } else {
      setTrip(tripRes.data);
      setExpenses(expensesRes.data ?? []);
      setItinerary(itineraryRes.data ?? []);
      setChecklist(checklistRes.data ?? []);
    }
    setLoading(false);
  }, [user, tripId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function updateTrip(partial) {
    const { data, error } = await supabase
      .from("trips")
      .update(partial)
      .eq("id", tripId)
      .select()
      .single();
    if (error) throw error;
    setTrip(data);
  }

  async function addExpense({ name, amount, category, date }) {
    const { data, error } = await supabase
      .from("trip_expenses")
      .insert({ trip_id: tripId, user_id: user.id, name, amount, category, date })
      .select()
      .single();
    if (error) throw error;
    setExpenses((prev) => [data, ...prev]);
  }

  async function deleteExpense(id) {
    const { error } = await supabase.from("trip_expenses").delete().eq("id", id);
    if (error) throw error;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  async function addItineraryItem({ itemDate, itemTime, title, notes }) {
    const { data, error } = await supabase
      .from("trip_itinerary_items")
      .insert({ trip_id: tripId, user_id: user.id, item_date: itemDate, item_time: itemTime || null, title, notes })
      .select()
      .single();
    if (error) throw error;
    setItinerary((prev) =>
      [...prev, data].sort((a, b) => a.item_date.localeCompare(b.item_date))
    );
  }

  async function deleteItineraryItem(id) {
    const { error } = await supabase.from("trip_itinerary_items").delete().eq("id", id);
    if (error) throw error;
    setItinerary((prev) => prev.filter((i) => i.id !== id));
  }

  async function addChecklistItem(label) {
    const { data, error } = await supabase
      .from("trip_checklist_items")
      .insert({ trip_id: tripId, user_id: user.id, label })
      .select()
      .single();
    if (error) throw error;
    setChecklist((prev) => [...prev, data]);
  }

  async function toggleChecklistItem(id, checked) {
    const { error } = await supabase
      .from("trip_checklist_items")
      .update({ checked })
      .eq("id", id);
    if (error) throw error;
    setChecklist((prev) => prev.map((c) => (c.id === id ? { ...c, checked } : c)));
  }

  async function deleteChecklistItem(id) {
    const { error } = await supabase.from("trip_checklist_items").delete().eq("id", id);
    if (error) throw error;
    setChecklist((prev) => prev.filter((c) => c.id !== id));
  }

  return {
    trip,
    expenses,
    itinerary,
    checklist,
    loading,
    error,
    updateTrip,
    addExpense,
    deleteExpense,
    addItineraryItem,
    deleteItineraryItem,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    refetch: fetchAll,
  };
}
