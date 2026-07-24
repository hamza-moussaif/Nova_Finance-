import Layout from "../components/Layout";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import { useTransactions } from "../lib/useTransactions";

export default function Transactions() {
  const { transactions, loading, addTransaction, deleteTransaction } =
    useTransactions();

  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-muted">
            Every income and expense you've logged, all in one place.
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
