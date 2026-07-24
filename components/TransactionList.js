import { ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";
import { colorForCategory } from "../lib/categories";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function TransactionList({ transactions, loading, onDelete, limit }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const rows = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
      <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
        {t("transactions.recent")}
      </h2>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted dark:text-[#c3c2b7]">
          {t("transactions.loading")}
        </p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted dark:text-[#c3c2b7]">
          {t("transactions.noTransactions")}
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-[#2c2c2a]">
          {rows.map((tItem) => {
            const isIncome = tItem.type === "income";
            const color = colorForCategory(tItem.category, theme);
            return (
              <li key={tItem.id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: isIncome
                        ? "rgba(16,163,74,0.1)"
                        : `${color}1A`,
                    }}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
                    ) : (
                      <ArrowUpRight
                        className="h-4 w-4"
                        strokeWidth={1.75}
                        style={{ color }}
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tItem.name}</p>
                    <p className="text-xs text-muted dark:text-[#c3c2b7]">
                      {t(`categories.${tItem.category}`)} · {new Date(tItem.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-semibold ${
                      isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {currency.format(tItem.amount)}
                  </span>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(tItem.id)}
                      className="rounded-xl p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500 dark:text-white/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
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
