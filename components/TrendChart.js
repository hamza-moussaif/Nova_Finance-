import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../lib/currency";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const INCOME_COLOR = { light: "#0ca30c", dark: "#0ca30c" };
const EXPENSE_COLOR = { light: "#e34948", dark: "#e66767" };
const MONTHS_BACK = 12;

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:border-[#2c2c2a] dark:bg-[#1a1a19]">
      <p className="mb-1 text-xs font-medium text-gray-900 dark:text-white">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs" style={{ color: entry.fill }}>
          {entry.name}: {formatCurrency(entry.value, currency)}
        </p>
      ))}
    </div>
  );
}

export default function TrendChart({ transactions, currency }) {
  const { t } = useLanguage();
  const { theme } = useTheme();

  const data = useMemo(() => {
    const buckets = new Map();
    const now = new Date();

    for (let i = MONTHS_BACK - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.set(monthKey(d), {
        key: monthKey(d),
        label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
        income: 0,
        expense: 0,
      });
    }

    for (const tx of transactions) {
      const d = new Date(tx.date);
      const key = monthKey(d);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      if (tx.type === "income") {
        bucket.income += Number(tx.amount);
      } else {
        bucket.expense += Number(tx.amount);
      }
    }

    return Array.from(buckets.values());
  }, [transactions]);

  const incomeColor = INCOME_COLOR[theme];
  const expenseColor = EXPENSE_COLOR[theme];
  const gridColor = theme === "dark" ? "#2c2c2a" : "#e1e0d9";
  const axisColor = theme === "dark" ? "#c3c2b7" : "#898781";

  return (
    <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
      <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
        {t("dashboard.trend")}
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} margin={{ left: -16 }}>
            <CartesianGrid vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
              width={56}
              tickFormatter={(v) => formatCurrency(v, currency)}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: "rgba(128,128,128,0.08)" }} />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-gray-900 dark:text-white">{value}</span>
              )}
            />
            <Bar dataKey="income" name={t("dashboard.monthlyIncome")} fill={incomeColor} radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Bar dataKey="expense" name={t("dashboard.monthlyExpenses")} fill={expenseColor} radius={[4, 4, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
