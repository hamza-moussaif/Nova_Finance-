import { useState } from "react";
import { Plus, Loader2, Trash2, Repeat } from "lucide-react";
import Layout from "../components/Layout";
import { useRecurringTransactions } from "../lib/useRecurringTransactions";
import { useProfile } from "../context/ProfileContext";
import { formatCurrency } from "../lib/currency";
import { CATEGORY_NAMES } from "../lib/categories";
import { useLanguage } from "../context/LanguageContext";

const TODAY = () => new Date().toISOString().slice(0, 10);
const FREQUENCIES = ["weekly", "monthly", "yearly"];

export default function Recurring() {
  const { t } = useLanguage();
  const { profile } = useProfile();
  const { templates, loading, addTemplate, toggleActive, deleteTemplate } =
    useRecurringTransactions();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState(CATEGORY_NAMES[0]);
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState(TODAY());
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
      await addTemplate({
        name: name.trim(),
        amount: parsedAmount,
        type,
        category: type === "income" ? "Income" : category,
        frequency,
        startDate,
      });
      setName("");
      setAmount("");
      setStartDate(TODAY());
    } catch (err) {
      setError(err.message || t("form.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {t("recurring.title")}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#c3c2b7]">{t("recurring.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
              <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
                {t("recurring.list")}
              </h2>

              {loading ? (
                <p className="py-8 text-center text-sm text-muted dark:text-[#c3c2b7]">
                  {t("transactions.loading")}
                </p>
              ) : templates.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted dark:text-[#c3c2b7]">
                  {t("recurring.noRecurring")}
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-[#2c2c2a]">
                  {templates.map((tpl) => {
                    const isIncome = tpl.type === "income";
                    return (
                      <li key={tpl.id} className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-background dark:bg-white/5">
                            <Repeat className="h-4 w-4 text-muted dark:text-[#c3c2b7]" strokeWidth={1.75} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{tpl.name}</p>
                            <p className="text-xs text-muted dark:text-[#c3c2b7]">
                              {t(`recurring.${tpl.frequency}`)} ·{" "}
                              {tpl.type === "income" ? t("form.income") : t(`categories.${tpl.category}`)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-semibold ${
                              isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {formatCurrency(tpl.amount, profile.currency)}
                          </span>
                          <button
                            onClick={() => toggleActive(tpl.id, !tpl.active)}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                              tpl.active
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "bg-gray-100 text-muted dark:bg-white/10 dark:text-[#c3c2b7]"
                            }`}
                          >
                            {tpl.active ? t("recurring.active") : t("recurring.inactive")}
                          </button>
                          <button
                            onClick={() => deleteTemplate(tpl.id)}
                            className="rounded-xl p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500 dark:text-white/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]"
          >
            <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
              {t("recurring.add")}
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                  {t("recurring.frequency")}
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {t(`recurring.${f}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                  {t("recurring.startDate")}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
                />
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
                    {t("recurring.add")}
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
