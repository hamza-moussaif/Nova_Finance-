import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";

const DISMISS_KEY_PREFIX = "nova-finance-onboarding-dismissed-";

export default function OnboardingChecklist({ hasTransaction, hasIncome, hasGoal }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [dismissed, setDismissed] = useState(true);

  const hasBudget = Object.keys(profile.budget_allocation || {}).length > 0;

  const steps = [
    { key: "addTransaction", done: hasTransaction, href: "/transactions" },
    { key: "addIncome", done: hasIncome, href: "/salary" },
    { key: "setBudget", done: hasBudget, href: "/budgets" },
    { key: "setGoal", done: hasGoal, href: "/goals" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  useEffect(() => {
    if (!user) return;
    setDismissed(window.localStorage.getItem(`${DISMISS_KEY_PREFIX}${user.id}`) === "true");
  }, [user]);

  function handleDismiss() {
    if (user) window.localStorage.setItem(`${DISMISS_KEY_PREFIX}${user.id}`, "true");
    setDismissed(true);
  }

  if (dismissed || allDone) return null;

  return (
    <div className="mb-5 rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {t("onboarding.title")}
          </h2>
          <p className="mt-1 text-sm text-muted dark:text-[#c3c2b7]">{t("onboarding.subtitle")}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-xl p-1.5 text-gray-300 transition hover:bg-gray-50 hover:text-gray-900 dark:text-white/20 dark:hover:bg-white/5 dark:hover:text-white"
          aria-label={t("onboarding.dismiss")}
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <ul className="space-y-1.5">
        {steps.map((step) => (
          <li key={step.key}>
            <Link
              href={step.href}
              className={`flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
                step.done
                  ? "text-muted dark:text-[#c3c2b7]"
                  : "text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    step.done
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-gray-100 text-transparent dark:bg-white/10"
                  }`}
                >
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <span className={step.done ? "line-through" : ""}>{t(`onboarding.${step.key}`)}</span>
              </span>
              {!step.done && <ArrowRight className="h-3.5 w-3.5 text-muted dark:text-[#c3c2b7]" strokeWidth={1.75} />}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
