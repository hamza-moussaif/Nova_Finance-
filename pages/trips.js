import { useState } from "react";
import Link from "next/link";
import { Plus, Loader2, Trash2, MapPin, Calendar } from "lucide-react";
import Layout from "../components/Layout";
import { useTrips } from "../lib/useTrips";
import { useProfile } from "../context/ProfileContext";
import { formatCurrency, CURRENCIES } from "../lib/currency";
import { useLanguage } from "../context/LanguageContext";

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date(new Date().toDateString());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Trips() {
  const { t } = useLanguage();
  const { profile } = useProfile();
  const { trips, spentByTrip, loading, addTrip, deleteTrip } = useTrips();

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [currency, setCurrency] = useState(profile.currency || "USD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(t("trips.nameRequired"));
      return;
    }

    setSubmitting(true);
    try {
      await addTrip({
        name: name.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        budgetAmount: parseFloat(budgetAmount) || 0,
        currency,
      });
      setName("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setBudgetAmount("");
    } catch (err) {
      setError(err.message || t("form.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {t("trips.title")}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#c3c2b7]">{t("trips.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            {loading ? (
              <p className="py-8 text-center text-sm text-muted dark:text-[#c3c2b7]">
                {t("transactions.loading")}
              </p>
            ) : trips.length === 0 ? (
              <div className="rounded-3xl bg-surface p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
                <p className="text-sm text-muted dark:text-[#c3c2b7]">{t("trips.noTrips")}</p>
              </div>
            ) : (
              trips.map((trip) => {
                const spent = spentByTrip[trip.id] || 0;
                const pct = trip.budget_amount > 0 ? Math.min(100, (spent / trip.budget_amount) * 100) : 0;
                const over = spent > trip.budget_amount && trip.budget_amount > 0;
                const remaining = daysUntil(trip.start_date);

                return (
                  <div
                    key={trip.id}
                    className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]"
                  >
                    <div className="flex items-start justify-between">
                      <Link href={`/trips/${trip.id}`} className="group flex-1">
                        <p className="text-base font-semibold text-gray-900 group-hover:underline dark:text-white">
                          {trip.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted dark:text-[#c3c2b7]">
                          {trip.destination && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                              {trip.destination}
                            </span>
                          )}
                          {trip.start_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                              {new Date(trip.start_date).toLocaleDateString()}
                              {trip.end_date ? ` – ${new Date(trip.end_date).toLocaleDateString()}` : ""}
                            </span>
                          )}
                          {remaining !== null && remaining >= 0 && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary dark:bg-white/10 dark:text-white">
                              {remaining === 0 ? t("trips.today") : `${remaining} ${t("trips.daysToGo")}`}
                            </span>
                          )}
                        </div>
                      </Link>
                      <button
                        onClick={() => deleteTrip(trip.id)}
                        className="rounded-xl p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500 dark:text-white/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>

                    {trip.budget_amount > 0 && (
                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className={over ? "text-rose-600 dark:text-rose-400" : "text-muted dark:text-[#c3c2b7]"}>
                            {formatCurrency(spent, trip.currency)} / {formatCurrency(trip.budget_amount, trip.currency)}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: over ? "#e34948" : "#2a78d6" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]"
          >
            <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
              {t("trips.addTrip")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                  {t("trips.name")}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("trips.namePlaceholder")}
                  className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                  {t("trips.destination")}
                </label>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t("trips.destinationPlaceholder")}
                  className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                    {t("trips.startDate")}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                    {t("trips.endDate")}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                    {t("trips.budget")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                    {t("profile.currency")}
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 disabled:opacity-60 dark:bg-white/10 dark:hover:bg-white/20"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {t("trips.addTrip")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
