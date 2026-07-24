import { useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import Layout from "../components/Layout";
import SummaryCard from "../components/SummaryCard";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import CategoryDonutChart from "../components/CategoryDonutChart";
import { useTransactions } from "../lib/useTransactions";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function Dashboard() {
  const { transactions, loading, addTransaction, deleteTransaction } =
    useTransactions();

  const stats = useMemo(() => {
    let totalBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    const expensesByCategory = {};

    for (const t of transactions) {
      const amount = Number(t.amount);
      totalBalance += t.type === "income" ? amount : -amount;

      if (isThisMonth(t.date)) {
        if (t.type === "income") {
          monthlyIncome += amount;
        } else {
          monthlyExpenses += amount;
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
    };
  }, [transactions]);

  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Overview
          </h1>
          <p className="mt-1 text-sm text-muted">
            Here's how your money is moving this month.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <SummaryCard
            label="Total Balance"
            value={currency.format(stats.totalBalance)}
            icon={Wallet}
            tone="default"
          />
          <SummaryCard
            label="Monthly Income"
            value={currency.format(stats.monthlyIncome)}
            icon={TrendingUp}
            tone="positive"
          />
          <SummaryCard
            label="Monthly Expenses"
            value={currency.format(stats.monthlyExpenses)}
            icon={TrendingDown}
            tone="negative"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CategoryDonutChart expensesByCategory={stats.expensesByCategory} />
            <div className="mt-5">
              <TransactionList
                transactions={transactions}
                loading={loading}
                onDelete={deleteTransaction}
                limit={5}
              />
            </div>
          </div>
          <div>
            <TransactionForm onAdd={addTransaction} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
