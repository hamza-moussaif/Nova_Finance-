import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev so a missing .env.local doesn't silently break auth calls.
  console.warn(
    "Missing Supabase env vars. Copy .env.local.example to .env.local and fill in your project keys."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
