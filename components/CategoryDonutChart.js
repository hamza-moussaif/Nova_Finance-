import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { colorForCategory } from "../lib/categories";
import { formatCurrency } from "../lib/currency";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

function CustomTooltip({ active, payload, currency }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:border-[#2c2c2a] dark:bg-[#1a1a19]">
      <p className="text-xs font-medium text-gray-900 dark:text-white">{name}</p>
      <p className="text-xs text-muted dark:text-[#c3c2b7]">{formatCurrency(value, currency)}</p>
    </div>
  );
}

export default function CategoryDonutChart({ expensesByCategory, currency = "USD" }) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const data = expensesByCategory.map((d) => ({
    ...d,
    label: t(`categories.${d.name}`),
    color: colorForCategory(d.name, theme),
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
      <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
        {t("expenses.byCategory")}
      </h2>

      {data.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted dark:text-[#c3c2b7]">
          {t("expenses.noExpenses")}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-56 w-56 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={2}
                  cornerRadius={6}
                  stroke="none"
                >
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip currency={currency} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-muted dark:text-[#c3c2b7]">{t("expenses.total")}</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>

          <ul className="w-full space-y-2.5">
            {data
              .sort((a, b) => b.value - a.value)
              .map((d) => (
                <li key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-gray-900 dark:text-white">{d.label}</span>
                  </div>
                  <span className="font-medium text-muted dark:text-[#c3c2b7]">
                    {formatCurrency(d.value, currency)}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
