import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import TransactionFilters from "../components/TransactionFilters";
import { useTransactions } from "../lib/useTransactions";
import { useLanguage } from "../context/LanguageContext";

const EMPTY_FILTERS = { search: "", type: "all", category: "all", from: "", to: "" };

export default function Transactions() {
  const { t } = useLanguage();
  const { transactions, loading, addTransaction, deleteTransaction } =
    useTransactions();
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filters.type !== "all" && tx.type !== filters.type) return false;
      if (filters.category !== "all" && tx.category !== filters.category) return false;
      if (filters.from && tx.date < filters.from) return false;
      if (filters.to && tx.date > filters.to) return false;
      if (filters.search && !tx.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filters]);

  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {t("transactions.title")}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#c3c2b7]">
            {t("transactions.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TransactionFilters filters={filters} onChange={setFilters} />
            <TransactionList
              transactions={filteredTransactions}
              loading={loading}
              onDelete={deleteTransaction}
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
