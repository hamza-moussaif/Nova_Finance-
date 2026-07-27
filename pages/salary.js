import { useMemo, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import Layout from "../components/Layout";
import CircularProgress from "../components/CircularProgress";
import GoalCard from "../components/GoalCard";
import { useTransactions } from "../lib/useTransactions";
import { useProfile } from "../context/ProfileContext";
import { useSavingsGoals } from "../lib/useSavingsGoals";
import { formatCurrency } from "../lib/currency";
import { CATEGORY_GROUP, BUDGET_GROUP_TARGETS } from "../lib/categories";
import { useLanguage } from "../context/LanguageContext";

const TODAY = () => new Date().toISOString().slice(0, 10);

function AddIncomeForm({ onAdd }) {
  const { t } = useLanguage();
  const [name, setName] = useState("Salary");
  const [amount, setAmount] = useState("");
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
        type: "income",
        category: "Income",
        date,
      });
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
        {t("salary.addIncome")}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
            {t("form.name")}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("salary.incomeNamePlaceholder")}
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
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
            {t("form.date")}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 disabled:opacity-60 dark:bg-white/10 dark:hover:bg-white/20"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Plus className="h-4 w-4" />
            {t("salary.addIncome")}
          </>
        )}
      </button>
    </form>
  );
}

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

const GROUP_COLORS = {
  needs: "#2a78d6",
  wants: "#eda100",
  savings: "#1baf7a",
};

function GroupBar({ label, actual, target, income, currency, color }) {
  const targetAmount = (income * target) / 100;
  const pct = targetAmount > 0 ? Math.min(100, (actual / targetAmount) * 100) : 0;
  const over = actual > targetAmount && targetAmount > 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-900 dark:text-white">{label}</span>
        <span className={`text-xs ${over ? "text-rose-600 dark:text-rose-400" : "text-muted dark:text-[#c3c2b7]"}`}>
          {formatCurrency(actual, currency)} / {formatCurrency(targetAmount, currency)} ({target}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: over ? "#e34948" : color }}
        />
      </div>
    </div>
  );
}

export default function Salary() {
  const { t } = useLanguage();
  const { transactions, addTransaction } = useTransactions();
  const { profile } = useProfile();
  const { goals, contribute } = useSavingsGoals();
  const currency = profile.currency;

  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    const byGroup = { needs: 0, wants: 0 };

    for (const tx of transactions) {
      if (!isThisMonth(tx.date)) continue;
      const amount = Number(tx.amount);
      if (tx.type === "income") {
        income += amount;
      } else {
        expenses += amount;
        const group = CATEGORY_GROUP[tx.category] || "wants";
        if (group !== "savings") byGroup[group] += amount;
      }
    }

    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    return { income, expenses, savings, savingsRate, byGroup };
  }, [transactions]);

  const gaugeColor =
    stats.savingsRate >= BUDGET_GROUP_TARGETS.savings
      ? "#1baf7a"
      : stats.savingsRate >= 0
      ? "#eda100"
      : "#e34948";

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {t("salary.title")}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#c3c2b7]">{t("salary.subtitle")}</p>
        </div>

        <div className="mb-5">
          <AddIncomeForm onAdd={addTransaction} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19] lg:col-span-1">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
              {t("salary.savingsRate")}
            </h2>
            <div className="flex justify-center py-2">
              <CircularProgress
                percent={Math.max(0, stats.savingsRate)}
                value={`${stats.savingsRate.toFixed(0)}%`}
                label={t("salary.ofIncome")}
                color={gaugeColor}
              />
            </div>
            <p className="mt-4 text-center text-xs text-muted dark:text-[#c3c2b7]">
              {t("salary.recommendedRate")}: {BUDGET_GROUP_TARGETS.savings}%
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:col-span-2">
            <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
              <p className="text-sm font-medium text-muted dark:text-[#c3c2b7]">{t("salary.income")}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(stats.income, currency)}
              </p>
            </div>
            <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
              <p className="text-sm font-medium text-muted dark:text-[#c3c2b7]">{t("salary.expenses")}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(stats.expenses, currency)}
              </p>
            </div>
            <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
              <p className="text-sm font-medium text-muted dark:text-[#c3c2b7]">{t("salary.netSavings")}</p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  stats.savings >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatCurrency(stats.savings, currency)}
              </p>
            </div>

            <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19] sm:col-span-3">
              <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
                {t("salary.breakdown")}
              </h2>
              <div className="space-y-5">
                <GroupBar
                  label={t("salary.needs")}
                  actual={stats.byGroup.needs}
                  target={BUDGET_GROUP_TARGETS.needs}
                  income={stats.income}
                  currency={currency}
                  color={GROUP_COLORS.needs}
                />
                <GroupBar
                  label={t("salary.wants")}
                  actual={stats.byGroup.wants}
                  target={BUDGET_GROUP_TARGETS.wants}
                  income={stats.income}
                  currency={currency}
                  color={GROUP_COLORS.wants}
                />
              </div>
              <p className="mt-5 text-xs text-muted dark:text-[#c3c2b7]">{t("salary.ruleNote")}</p>
            </div>
          </div>
        </div>

        {goals.length > 0 && (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t("goals.title")}
              </h2>
              <a href="/goals" className="text-sm font-medium text-primary hover:underline dark:text-white">
                {t("goals.title")} →
              </a>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {goals.slice(0, 2).map((goal) => (
                <GoalCard key={goal.id} goal={goal} currency={currency} onContribute={contribute} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
