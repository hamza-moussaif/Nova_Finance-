import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { colorForCategory } from "../lib/categories";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <p className="text-xs font-medium text-gray-900">{name}</p>
      <p className="text-xs text-muted">{currency.format(value)}</p>
    </div>
  );
}

export default function CategoryDonutChart({ expensesByCategory }) {
  const data = expensesByCategory.map((d) => ({
    ...d,
    color: colorForCategory(d.name),
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <h2 className="mb-5 text-base font-semibold text-gray-900">
        Expenses by category
      </h2>

      {data.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          No expenses recorded yet.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-56 w-56 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
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
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-muted">Total</span>
              <span className="text-lg font-semibold text-gray-900">
                {currency.format(total)}
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
                    <span className="text-gray-900">{d.name}</span>
                  </div>
                  <span className="font-medium text-muted">
                    {currency.format(d.value)}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
