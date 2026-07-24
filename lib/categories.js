// Expense categories and their chart colors, drawn from a validated categorical
// palette (fixed hue order — never cycled/reassigned) so donut segments stay
// colorblind-safe and consistent across the app. Dark-mode steps are the same
// hues re-stepped for the dark surface, not a separate palette.
export const EXPENSE_CATEGORIES = [
  { name: "Food", color: "#2a78d6", darkColor: "#3987e5" },
  { name: "Transport", color: "#eb6834", darkColor: "#d95926" },
  { name: "Housing", color: "#1baf7a", darkColor: "#199e70" },
  { name: "Entertainment", color: "#eda100", darkColor: "#c98500" },
  { name: "Shopping", color: "#e87ba4", darkColor: "#d55181" },
  { name: "Health", color: "#008300", darkColor: "#008300" },
  { name: "Utilities", color: "#4a3aa7", darkColor: "#9085e9" },
  { name: "Other", color: "#e34948", darkColor: "#e66767" },
];

export const CATEGORY_NAMES = EXPENSE_CATEGORIES.map((c) => c.name);

export function colorForCategory(name, theme = "light") {
  const match = EXPENSE_CATEGORIES.find((c) => c.name === name);
  if (!match) return "#898781";
  return theme === "dark" ? match.darkColor : match.color;
}
