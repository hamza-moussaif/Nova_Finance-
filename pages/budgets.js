import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import Layout from "../components/Layout";
import { CATEGORY_NAMES, colorForCategory } from "../lib/categories";
import { useBudgets } from "../lib/useBudgets";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

export default function Budgets() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { budgetAllocation, loading, saveBudgets } = useBudgets();
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setDraft(budgetAllocation);
  }, [budgetAllocation]);

  const total = useMemo(
    () => Object.values(draft).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [draft]
  );
  const overAllocated = total > 100;

  function updateCategory(name, value) {
    setDraft((prev) => ({ ...prev, [name]: Math.max(0, Math.min(100, Number(value) || 0)) }));
  }

  async function handleSave() {
    setSaving(true);
    setStatus("");
    try {
      await saveBudgets(draft);
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {t("budgets.title")}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#c3c2b7]">{t("budgets.subtitle")}</p>
        </div>

        <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-medium text-muted dark:text-[#c3c2b7]">
              {t("budgets.totalAllocated")}
            </span>
            <span
              className={`text-lg font-semibold ${
                overAllocated ? "text-rose-600 dark:text-rose-400" : "text-gray-900 dark:text-white"
              }`}
            >
              {total}%
            </span>
          </div>

          {overAllocated && (
            <p className="mb-5 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {t("budgets.overAllocated")}
            </p>
          )}

          {loading ? (
            <p className="py-8 text-center text-sm text-muted dark:text-[#c3c2b7]">
              {t("transactions.loading")}
            </p>
          ) : (
            <div className="space-y-5">
              {CATEGORY_NAMES.map((name) => {
                const value = draft[name] || 0;
                const color = colorForCategory(name, theme);
                return (
                  <div key={name}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {t(`categories.${name}`)}
                        </span>
                      </div>
                      <span className="font-medium text-muted dark:text-[#c3c2b7]">{value}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => updateCategory(name, e.target.value)}
                      className="w-full accent-primary"
                      style={{ accentColor: color }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {status === "saved" && (
            <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              {t("budgets.saved")}
            </p>
          )}
          {status === "error" && (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {t("budgets.saveError")}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 disabled:opacity-60 dark:bg-white/10 dark:hover:bg-white/20"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4" />
                {t("budgets.save")}
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}
