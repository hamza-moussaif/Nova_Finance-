import { useState } from "react";
import { Plus, Trash2, Target } from "lucide-react";
import { formatCurrency } from "../lib/currency";
import { useLanguage } from "../context/LanguageContext";

function daysUntil(deadline) {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date(new Date().toDateString());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function GoalCard({ goal, currency, onContribute, onDelete, compact }) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [adding, setAdding] = useState(false);

  const pct = goal.target_amount > 0
    ? Math.min(100, (goal.current_amount / goal.target_amount) * 100)
    : 0;
  const remaining = daysUntil(goal.deadline);
  const complete = pct >= 100;

  async function handleAdd(e) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    await onContribute(goal.id, value);
    setAmount("");
    setAdding(false);
  }

  return (
    <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Target className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{goal.name}</p>
            {goal.deadline && (
              <p className="text-xs text-muted dark:text-[#c3c2b7]">
                {remaining >= 0
                  ? `${remaining} ${t("goals.daysLeft")}`
                  : t("goals.deadlinePassed")}
              </p>
            )}
          </div>
        </div>
        {onDelete && !compact && (
          <button
            onClick={() => onDelete(goal.id)}
            className="rounded-xl p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500 dark:text-white/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(goal.current_amount, currency)}
          </span>
          <span className="text-muted dark:text-[#c3c2b7]">
            {t("goals.progress")} {formatCurrency(goal.target_amount, currency)}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {!compact && (
        <div className="mt-4">
          {adding ? (
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl border border-gray-100 bg-background px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
              />
              <button
                type="submit"
                className="shrink-0 rounded-2xl bg-primary px-3 py-2 text-sm font-medium text-white dark:bg-white/10"
              >
                {t("goals.addFunds")}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              disabled={complete}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-background py-2 text-sm font-medium text-muted transition hover:text-gray-900 disabled:opacity-50 dark:bg-white/5 dark:text-[#c3c2b7] dark:hover:text-white"
            >
              <Plus className="h-4 w-4" />
              {t("goals.addFunds")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
