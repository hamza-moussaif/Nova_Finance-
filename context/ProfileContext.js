import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const DEFAULT_PROFILE = {
  full_name: "",
  currency: "USD",
  budget_allocation: {},
  created_at: null,
};

const ProfileContext = createContext(undefined);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(DEFAULT_PROFILE);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data } = await supabase
      .from("profiles")
      .select("full_name, currency, budget_allocation, created_at")
      .eq("id", user.id)
      .maybeSingle();

    setProfile(data ?? DEFAULT_PROFILE);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function updateProfile(partial) {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...profile, ...partial })
      .select("full_name, currency, budget_allocation, created_at")
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile, refetch: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (ctx === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return ctx;
}
