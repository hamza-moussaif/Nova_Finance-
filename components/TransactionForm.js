import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { CATEGORY_NAMES } from "../lib/categories";
import { useLanguage } from "../context/LanguageContext";

const TODAY = () => new Date().toISOString().slice(0, 10);

export default function TransactionForm({ onAdd }) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState(CATEGORY_NAMES[0]);
  const [date, setDate] = useState(TODAY());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (!name.trim() || !parsedAmount || parsedAmount <= 0) {
      setError(t("form.error"));
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        amount: parsedAmount,
        type,
        category: type === "income" ? "Income" : category,
        date,
      });
      setName("");
      setAmount("");
      setDate(TODAY());
    } catch (err) {
      setError(err.message || t("form.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]"
    >
      <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
        {t("form.addTransaction")}
      </h2>

      <div className="mb-4 flex gap-2 rounded-2xl bg-background p-1 dark:bg-white/5">
        {["expense", "income"].map((tType) => (
          <button
            key={tType}
            type="button"
            onClick={() => setType(tType)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium capitalize transition ${
              type === tType
                ? "bg-primary text-white shadow-soft dark:bg-white/10"
                : "text-muted hover:text-gray-900 dark:text-[#c3c2b7] dark:hover:text-white"
            }`}
          >
            {t(`form.${tType}`)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
            {t("form.name")}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("form.namePlaceholder")}
            className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
              {t("form.amount")}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
              {t("form.date")}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>

        {type === "expense" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
              {t("form.category")}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
            >
              {CATEGORY_NAMES.map((c) => (
                <option key={c} value={c}>
                  {t(`categories.${c}`)}
                </option>
              ))}
            </select>
          </div>
        )}

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
              {t("form.submit")}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
