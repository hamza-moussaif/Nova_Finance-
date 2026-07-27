import { createClient } from "@supabase/supabase-js";

// Server-side proxy to Finnhub's free quote endpoint. Keeping the API key
// here (not NEXT_PUBLIC_*) means it's never bundled into client JS.
//
// Requires a logged-in Supabase session (Authorization: Bearer <access_token>)
// so the route — and the paid Finnhub quota behind it — can't be hit by
// anonymous callers scripting requests straight at this URL.
export default async function handler(req, res) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  const { symbol } = req.query;
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!symbol || typeof symbol !== "string") {
    return res.status(400).json({ error: "Missing symbol" });
  }

  if (!apiKey) {
    return res.status(501).json({ error: "FINNHUB_API_KEY is not configured" });
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol.toUpperCase())}&token=${apiKey}`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: "Upstream request failed" });
    }

    const data = await response.json();

    // Finnhub returns all-zero fields for an unknown symbol instead of an error.
    if (data.c === 0 && data.pc === 0) {
      return res.status(404).json({ error: "Symbol not found" });
    }

    return res.status(200).json({
      symbol: symbol.toUpperCase(),
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
    });
  } catch {
    return res.status(502).json({ error: "Could not reach the market data provider" });
  }
}
