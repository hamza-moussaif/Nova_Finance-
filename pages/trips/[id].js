import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  MapPin,
  Wallet,
  CalendarDays,
  ListChecks,
} from "lucide-react";
import Layout from "../../components/Layout";
import { useTripDetail } from "../../lib/useTripDetail";
import { formatCurrency } from "../../lib/currency";
import { TRIP_EXPENSE_CATEGORY_NAMES, colorForTripCategory } from "../../lib/tripCategories";
import { useLanguage } from "../../context/LanguageContext";

const TODAY = () => new Date().toISOString().slice(0, 10);

function ExpenseForm({ onAdd }) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(TRIP_EXPENSE_CATEGORY_NAMES[0]);
  const [date, setDate] = useState(TODAY());
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!name.trim() || !parsed || parsed <= 0) return;
    setSubmitting(true);
    try {
      await onAdd({ name: name.trim(), amount: parsed, category, date });
      setName("");
      setAmount("");
      setDate(TODAY());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("form.name")}
        className="col-span-2 rounded-2xl border border-gray-100 bg-background px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white sm:col-span-1"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        className="rounded-2xl border border-gray-100 bg-background px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-2xl border border-gray-100 bg-background px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
      >
        {TRIP_EXPENSE_CATEGORY_NAMES.map((c) => (
          <option key={c} value={c}>
            {t(`tripCategories.${c}`)}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-2xl border border-gray-100 bg-background px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
      />
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center rounded-2xl bg-primary px-3 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 disabled:opacity-60 dark:bg-white/10 dark:hover:bg-white/20"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      </button>
    </form>
  );
}

function ItineraryForm({ onAdd }) {
  const { t } = useLanguage();
  const [itemDate, setItemDate] = useState(TODAY());
  const [itemTime, setItemTime] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onAdd({ itemDate, itemTime, title: title.trim() });
      setTitle("");
      setItemTime("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <input
        type="date"
        value={itemDate}
        onChange={(e) => setItemDate(e.target.value)}
        className="rounded-2xl border border-gray-100 bg-background px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
      />
      <input
        type="time"
        value={itemTime}
        onChange={(e) => setItemTime(e.target.value)}
        className="rounded-2xl border border-gray-100 bg-background px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
      />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("trips.itineraryPlaceholder")}
        className="col-span-2 rounded-2xl border border-gray-100 bg-background px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white sm:col-span-1"
      />
      <button
        type="submit"
        disabled={submitting}
        className="col-span-2 flex items-center justify-center rounded-2xl bg-primary px-3 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 disabled:opacity-60 dark:bg-white/10 dark:hover:bg-white/20 sm:col-span-4"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      </button>
    </form>
  );
}

function ChecklistForm({ onAdd }) {
  const { t } = useLanguage();
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!label.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(label.trim());
      setLabel("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-5 flex gap-2">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder={t("trips.checklistPlaceholder")}
        className="w-full rounded-2xl border border-gray-100 bg-background px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
      />
      <button
        type="submit"
        disabled={submitting}
        className="flex shrink-0 items-center justify-center rounded-2xl bg-primary px-3 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 disabled:opacity-60 dark:bg-white/10 dark:hover:bg-white/20"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      </button>
    </form>
  );
}

export default function TripDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useLanguage();
  const {
    trip,
    expenses,
    itinerary,
    checklist,
    loading,
    addExpense,
    deleteExpense,
    addItineraryItem,
    deleteItineraryItem,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
  } = useTripDetail(id);

  if (loading || !trip) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl py-8 text-center text-sm text-muted dark:text-[#c3c2b7]">
          {t("transactions.loading")}
        </div>
      </Layout>
    );
  }

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remaining = trip.budget_amount - totalSpent;
  const pct = trip.budget_amount > 0 ? Math.min(100, (totalSpent / trip.budget_amount) * 100) : 0;
  const over = totalSpent > trip.budget_amount && trip.budget_amount > 0;
  const checkedCount = checklist.filter((c) => c.checked).length;

  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <Link
          href="/trips"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-gray-900 dark:text-[#c3c2b7] dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          {t("trips.title")}
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {trip.name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted dark:text-[#c3c2b7]">
            {trip.destination && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" strokeWidth={1.75} />
                {trip.destination}
              </span>
            )}
            {trip.start_date && (
              <span>
                {new Date(trip.start_date).toLocaleDateString()}
                {trip.end_date ? ` – ${new Date(trip.end_date).toLocaleDateString()}` : ""}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
            <div className="mb-5 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted dark:text-[#c3c2b7]" strokeWidth={1.75} />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t("trips.budgetOverview")}
              </h2>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-muted dark:text-[#c3c2b7]">{t("trips.budget")}</p>
                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  {formatCurrency(trip.budget_amount, trip.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted dark:text-[#c3c2b7]">{t("trips.spent")}</p>
                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  {formatCurrency(totalSpent, trip.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted dark:text-[#c3c2b7]">{t("trips.remaining")}</p>
                <p
                  className={`mt-1 text-base font-semibold sm:text-lg ${
                    remaining < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {formatCurrency(remaining, trip.currency)}
                </p>
              </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: over ? "#e34948" : "#2a78d6" }}
              />
            </div>

            <div className="mt-6">
              <ExpenseForm onAdd={addExpense} />
              {expenses.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted dark:text-[#c3c2b7]">
                  {t("trips.noExpenses")}
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-[#2c2c2a]">
                  {expenses.map((exp) => (
                    <li key={exp.id} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: colorForTripCategory(exp.category) }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{exp.name}</p>
                          <p className="text-xs text-muted dark:text-[#c3c2b7]">
                            {t(`tripCategories.${exp.category}`)} · {new Date(exp.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(exp.amount, trip.currency)}
                        </span>
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="rounded-xl p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500 dark:text-white/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
            <div className="mb-5 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted dark:text-[#c3c2b7]" strokeWidth={1.75} />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t("trips.itinerary")}
              </h2>
            </div>

            <ItineraryForm onAdd={addItineraryItem} />

            {itinerary.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted dark:text-[#c3c2b7]">
                {t("trips.noItinerary")}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {itinerary.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl bg-background px-4 py-2.5 dark:bg-white/5"
                  >
                    <div>
                      <p className="text-xs text-muted dark:text-[#c3c2b7]">
                        {new Date(item.item_date).toLocaleDateString()}
                        {item.item_time ? ` · ${item.item_time}` : ""}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                    </div>
                    <button
                      onClick={() => deleteItineraryItem(item.id)}
                      className="rounded-xl p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500 dark:text-white/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-muted dark:text-[#c3c2b7]" strokeWidth={1.75} />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("trips.checklist")}
                </h2>
              </div>
              {checklist.length > 0 && (
                <span className="text-xs text-muted dark:text-[#c3c2b7]">
                  {checkedCount}/{checklist.length}
                </span>
              )}
            </div>

            <ChecklistForm onAdd={addChecklistItem} />

            {checklist.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted dark:text-[#c3c2b7]">
                {t("trips.noChecklist")}
              </p>
            ) : (
              <ul className="space-y-2">
                {checklist.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-1">
                    <label className="flex flex-1 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => toggleChecklistItem(item.id, e.target.checked)}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      <span
                        className={`text-sm ${
                          item.checked
                            ? "text-muted line-through dark:text-[#c3c2b7]"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {item.label}
                      </span>
                    </label>
                    <button
                      onClick={() => deleteChecklistItem(item.id)}
                      className="rounded-xl p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500 dark:text-white/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
