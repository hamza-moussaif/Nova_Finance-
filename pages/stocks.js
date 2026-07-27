import { useEffect, useState } from "react";
import { Plus, RefreshCw, TrendingUp, TrendingDown, X, Loader2, AlertCircle } from "lucide-react";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

const DEFAULT_WATCHLIST = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN"];
const STORAGE_KEY = "nova-finance-watchlist";

// Finnhub's free /quote endpoint covers more than plain US tickers — crypto and
// forex use an exchange-prefixed symbol, and many non-US exchanges work with a
// dot suffix. These are just well-known examples to make that discoverable.
const MARKETS = [
  { key: "us", symbols: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META"] },
  { key: "crypto", symbols: ["BINANCE:BTCUSDT", "BINANCE:ETHUSDT", "BINANCE:SOLUSDT", "BINANCE:BNBUSDT"] },
  { key: "forex", symbols: ["OANDA:EUR_USD", "OANDA:GBP_USD", "OANDA:USD_JPY", "OANDA:USD_CHF"] },
  { key: "europe", symbols: ["NESN.SW", "SAP.DE", "MC.PA", "SIE.DE"] },
  { key: "asia", symbols: ["7203.T", "0700.HK", "005930.KS"] },
];

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 4,
});

const rateFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

// Forex quotes are exchange rates, not USD amounts — formatting "$1.0850" for
// EUR/USD would be misleading, so those render as a plain number instead.
function formatQuoteValue(symbol, value) {
  return symbol.startsWith("OANDA:") ? rateFormatter.format(value) : priceFormatter.format(value);
}

export default function Stocks() {
  const { t } = useLanguage();
  const { session } = useAuth();
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
    if (!session) return;
    fetchQuotes(watchlist);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist, session]);

  async function fetchQuotes(symbols) {
    if (symbols.length === 0) {
      setLoading(false);
      return;
    }
    if (!session) return;
    setLoading(true);
    setError("");

    try {
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (res.status === 501) {
              setApiUnavailable(true);
              return [symbol, { status: "unavailable" }];
            }
            if (res.status === 404) {
              return [symbol, { status: "not_found" }];
            }
            if (!res.ok) {
              return [symbol, { status: "error" }];
            }
            const data = await res.json();
            return [symbol, { status: "ok", ...data }];
          } catch {
            return [symbol, { status: "error" }];
          }
        })
      );
      // Merge rather than replace — a slow/failed fetch for one symbol should
      // never wipe out quotes already fetched successfully for others.
      setQuotes((prev) => ({ ...prev, ...Object.fromEntries(results) }));
    } catch {
      setError(t("stocks.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  function addSymbolValue(rawSymbol) {
    const symbol = rawSymbol.trim().toUpperCase();
    if (!symbol || watchlist.includes(symbol)) return;
    setWatchlist((prev) => [...prev, symbol]);
  }

  function addSymbol(e) {
    e.preventDefault();
    addSymbolValue(symbolInput);
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

        <div className="mb-6 rounded-3xl bg-surface p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
          <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            {t("stocks.popularMarkets")}
          </p>
          <div className="space-y-3">
            {MARKETS.map((market) => (
              <div key={market.key}>
                <p className="mb-1.5 text-xs font-medium text-muted dark:text-[#c3c2b7]">
                  {t(`stocks.market.${market.key}`)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {market.symbols.map((symbol) => {
                    const alreadyAdded = watchlist.includes(symbol);
                    return (
                      <button
                        key={symbol}
                        onClick={() => addSymbolValue(symbol)}
                        disabled={alreadyAdded}
                        className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted transition hover:text-gray-900 disabled:cursor-default disabled:opacity-40 dark:bg-white/5 dark:text-[#c3c2b7] dark:hover:text-white"
                      >
                        {symbol}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {watchlist.map((symbol) => {
            const quote = quotes[symbol];
            const status = quote?.status;
            const up = quote?.change >= 0;
            return (
              <div
                key={symbol}
                className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{symbol}</p>
                    {status === "ok" ? (
                      <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                        {formatQuoteValue(symbol, quote.price)}
                      </p>
                    ) : status === "not_found" ? (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {t("stocks.notFound")}
                      </p>
                    ) : status === "error" ? (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-rose-600 dark:text-rose-400">
                        <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {t("stocks.quoteError")}
                      </p>
                    ) : status === "unavailable" ? (
                      <p className="mt-1 text-sm text-muted dark:text-[#c3c2b7]">—</p>
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

                {status === "ok" && (
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
                    {formatQuoteValue(symbol, Math.abs(quote.change))} ({quote.changePercent?.toFixed(2)}%)
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
