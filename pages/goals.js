import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import Layout from "../components/Layout";
import GoalCard from "../components/GoalCard";
import { useSavingsGoals } from "../lib/useSavingsGoals";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";

export default function Goals() {
  const { t } = useLanguage();
  const { profile } = useProfile();
  const { goals, loading, addGoal, contribute, deleteGoal } = useSavingsGoals();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const parsed = parseFloat(targetAmount);
    if (!name.trim() || !parsed || parsed <= 0) {
      setError(t("form.error"));
      return;
    }

    setSubmitting(true);
    try {
      await addGoal({ name: name.trim(), targetAmount: parsed, deadline });
      setName("");
      setTargetAmount("");
      setDeadline("");
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
            {t("goals.title")}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#c3c2b7]">{t("goals.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            {loading ? (
              <p className="py-8 text-center text-sm text-muted dark:text-[#c3c2b7]">
                {t("transactions.loading")}
              </p>
            ) : goals.length === 0 ? (
              <div className="rounded-3xl bg-surface p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
                <p className="text-sm text-muted dark:text-[#c3c2b7]">{t("goals.noGoals")}</p>
              </div>
            ) : (
              goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  currency={profile.currency}
                  onContribute={contribute}
                  onDelete={deleteGoal}
                />
              ))
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]"
          >
            <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
              {t("goals.addGoal")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                  {t("goals.name")}
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
                  {t("goals.targetAmount")}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                  {t("goals.deadline")}
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
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
                    {t("goals.addGoal")}
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
