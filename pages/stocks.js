import { useEffect, useState } from "react";
import { Plus, RefreshCw, TrendingUp, TrendingDown, X, Loader2 } from "lucide-react";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";

const DEFAULT_WATCHLIST = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN"];
const STORAGE_KEY = "nova-finance-watchlist";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Stocks() {
  const { t } = useLanguage();
  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST);
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [symbolInput, setSymbolInput] = useState("");
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch {
        setWatchlist(DEFAULT_WATCHLIST);
      }
    }
  }, []);

  useEffect(() => {
    fetchQuotes(watchlist);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist]);

  async function fetchQuotes(symbols) {
    if (symbols.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
          if (res.status === 501) {
            setApiUnavailable(true);
            return [symbol, null];
          }
          if (!res.ok) return [symbol, null];
          const data = await res.json();
          return [symbol, data];
        })
      );
      setQuotes(Object.fromEntries(results));
    } catch {
      setError(t("stocks.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  function addSymbol(e) {
    e.preventDefault();
    const symbol = symbolInput.trim().toUpperCase();
    if (!symbol || watchlist.includes(symbol)) return;
    setWatchlist((prev) => [...prev, symbol]);
    setSymbolInput("");
  }

  function removeSymbol(symbol) {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
    setQuotes((prev) => {
      const next = { ...prev };
      delete next[symbol];
      return next;
    });
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {t("stocks.title")}
            </h1>
            <p className="mt-1 text-sm text-muted dark:text-[#c3c2b7]">{t("stocks.subtitle")}</p>
          </div>
          <button
            onClick={() => fetchQuotes(watchlist)}
            disabled={loading}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-surface px-4 py-2 text-sm font-medium text-muted shadow-soft transition hover:text-gray-900 disabled:opacity-60 dark:bg-[#1a1a19] dark:text-[#c3c2b7] dark:hover:text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
            )}
            {t("stocks.refresh")}
          </button>
        </div>

        {apiUnavailable && (
          <div className="mb-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            {t("stocks.apiKeyMissing")}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={addSymbol} className="mb-5 flex gap-2">
          <input
            value={symbolInput}
            onChange={(e) => setSymbolInput(e.target.value)}
            placeholder={t("stocks.addPlaceholder")}
            className="w-full rounded-2xl border border-gray-100 bg-surface px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-[#1a1a19] dark:text-white"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 dark:bg-white/10 dark:hover:bg-white/20"
          >
            <Plus className="h-4 w-4" />
            {t("stocks.add")}
          </button>
        </form>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {watchlist.map((symbol) => {
            const quote = quotes[symbol];
            const up = quote?.change >= 0;
            return (
              <div
                key={symbol}
                className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{symbol}</p>
                    {quote ? (
                      <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                        {priceFormatter.format(quote.price)}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-muted dark:text-[#c3c2b7]">
                        {loading ? t("transactions.loading") : "—"}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeSymbol(symbol)}
                    className="rounded-xl p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500 dark:text-white/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>

                {quote && (
                  <div
                    className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${
                      up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {up ? (
                      <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
                    ) : (
                      <TrendingDown className="h-4 w-4" strokeWidth={1.75} />
                    )}
                    {priceFormatter.format(Math.abs(quote.change))} ({quote.changePercent?.toFixed(2)}%)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
