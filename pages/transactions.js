import Layout from "../components/Layout";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import { useTransactions } from "../lib/useTransactions";
import { useLanguage } from "../context/LanguageContext";

export default function Transactions() {
  const { t } = useLanguage();
  const { transactions, loading, addTransaction, deleteTransaction } =
    useTransactions();

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
            <TransactionList
              transactions={transactions}
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
