import { useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import Layout from "../components/Layout";
import SummaryCard from "../components/SummaryCard";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import CategoryDonutChart from "../components/CategoryDonutChart";
import TrendChart from "../components/TrendChart";
import { useTransactions } from "../lib/useTransactions";
import { useProfile } from "../context/ProfileContext";
import { colorForCategory, DEFAULT_BUDGET_ALLOCATION } from "../lib/categories";
import { formatCurrency } from "../lib/currency";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function Dashboard() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { transactions, loading, addTransaction, deleteTransaction } =
    useTransactions();
  const { profile } = useProfile();
  const currency = profile.currency;
  const budgetAllocation =
    Object.keys(profile.budget_allocation || {}).length > 0
      ? profile.budget_allocation
      : DEFAULT_BUDGET_ALLOCATION;

  const stats = useMemo(() => {
    let totalBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    const expensesByCategory = {};
    const monthlyExpensesByCategory = {};

    for (const t of transactions) {
      const amount = Number(t.amount);
      totalBalance += t.type === "income" ? amount : -amount;

      if (isThisMonth(t.date)) {
        if (t.type === "income") {
          monthlyIncome += amount;
        } else {
          monthlyExpenses += amount;
          monthlyExpensesByCategory[t.category] =
            (monthlyExpensesByCategory[t.category] || 0) + amount;
        }
      }

      if (t.type === "expense") {
        expensesByCategory[t.category] =
          (expensesByCategory[t.category] || 0) + amount;
      }
    }

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      expensesByCategory: Object.entries(expensesByCategory).map(
        ([name, value]) => ({ name, value })
      ),
      monthlyExpensesByCategory,
    };
  }, [transactions]);

  const budgetRows = Object.entries(budgetAllocation)
    .filter(([, percent]) => percent > 0)
    .map(([category, percent]) => {
      const allocated = (stats.monthlyIncome * percent) / 100;
      const spent = stats.monthlyExpensesByCategory[category] || 0;
      return { category, percent, allocated, spent };
    });

  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {t("dashboard.overview")}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#c3c2b7]">{t("dashboard.subtitle")}</p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <SummaryCard
            label={t("dashboard.totalBalance")}
            value={formatCurrency(stats.totalBalance, currency)}
            icon={Wallet}
            tone="default"
          />
          <SummaryCard
            label={t("dashboard.monthlyIncome")}
            value={formatCurrency(stats.monthlyIncome, currency)}
            icon={TrendingUp}
            tone="positive"
          />
          <SummaryCard
            label={t("dashboard.monthlyExpenses")}
            value={formatCurrency(stats.monthlyExpenses, currency)}
            icon={TrendingDown}
            tone="negative"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <TrendChart transactions={transactions} currency={currency} />
            <CategoryDonutChart expensesByCategory={stats.expensesByCategory} currency={currency} />

            <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
              <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
                {t("dashboard.budgetProgress")}
              </h2>
              <div className="space-y-4">
                {budgetRows.map(({ category, allocated, spent }) => {
                  const color = colorForCategory(category, theme);
                  const pct = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
                  const over = spent > allocated;
                  return (
                    <div key={category}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {t(`categories.${category}`)}
                        </span>
                        <span
                          className={`text-xs ${
                            over ? "text-rose-600 dark:text-rose-400" : "text-muted dark:text-[#c3c2b7]"
                          }`}
                        >
                          {over
                            ? t("dashboard.overBudget")
                            : `${formatCurrency(spent, currency)} ${t("dashboard.spentOfAllocated")} ${formatCurrency(allocated, currency)}`}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: over ? "#e34948" : color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {Object.keys(profile.budget_allocation || {}).length === 0 && (
                <p className="mt-4 text-xs text-muted dark:text-[#c3c2b7]">
                  {t("dashboard.defaultBudgetNotice")}{" "}
                  <a href="/budgets" className="font-medium text-primary underline dark:text-white">
                    {t("dashboard.setBudget")}
                  </a>
                </p>
              )}
            </div>

            <TransactionList
              transactions={transactions}
              loading={loading}
              onDelete={deleteTransaction}
              limit={5}
            />
          </div>
          <div>
            <TransactionForm onAdd={addTransaction} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
