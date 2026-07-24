// Expense categories and their chart colors, drawn from a validated categorical
// palette (fixed hue order — never cycled/reassigned) so donut segments stay
// colorblind-safe and consistent across the app.
export const EXPENSE_CATEGORIES = [
  { name: "Food", color: "#2a78d6" },
  { name: "Transport", color: "#eb6834" },
  { name: "Housing", color: "#1baf7a" },
  { name: "Entertainment", color: "#eda100" },
  { name: "Shopping", color: "#e87ba4" },
  { name: "Health", color: "#008300" },
  { name: "Utilities", color: "#4a3aa7" },
  { name: "Other", color: "#e34948" },
];

export const CATEGORY_NAMES = EXPENSE_CATEGORIES.map((c) => c.name);

export function colorForCategory(name) {
  const match = EXPENSE_CATEGORIES.find((c) => c.name === name);
  return match ? match.color : "#898781";
}
