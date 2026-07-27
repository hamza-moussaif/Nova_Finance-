// A small, separate palette for trip-expense tags. These are badge colors on
// a list, not a chart series, so they don't need the categorical fixed-order
// guarantee the dashboard donut relies on.
export const TRIP_EXPENSE_CATEGORIES = [
  { name: "Transport", color: "#eb6834" },
  { name: "Lodging", color: "#2a78d6" },
  { name: "Food", color: "#1baf7a" },
  { name: "Activities", color: "#eda100" },
  { name: "Shopping", color: "#e87ba4" },
  { name: "Other", color: "#898781" },
];

export const TRIP_EXPENSE_CATEGORY_NAMES = TRIP_EXPENSE_CATEGORIES.map((c) => c.name);

export function colorForTripCategory(name) {
  const match = TRIP_EXPENSE_CATEGORIES.find((c) => c.name === name);
  return match ? match.color : "#898781";
}
