import { ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";
import { colorForCategory } from "../lib/categories";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function TransactionList({ transactions, loading, onDelete, limit }) {
  const rows = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <h2 className="mb-5 text-base font-semibold text-gray-900">
        Recent transactions
      </h2>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          No transactions yet. Add your first one to get started.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {rows.map((t) => {
            const isIncome = t.type === "income";
            return (
              <li key={t.id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: isIncome
                        ? "rgba(16,163,74,0.1)"
                        : `${colorForCategory(t.category)}1A`,
                    }}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
                    ) : (
                      <ArrowUpRight
                        className="h-4 w-4"
                        strokeWidth={1.75}
                        style={{ color: colorForCategory(t.category) }}
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-muted">
                      {t.category} · {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-semibold ${
                      isIncome ? "text-emerald-600" : "text-gray-900"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {currency.format(t.amount)}
                  </span>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(t.id)}
                      className="rounded-xl p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
