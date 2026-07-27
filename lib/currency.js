// A broad-enough set of world currencies for an international audience.
// Symbols are resolved by Intl.NumberFormat itself — we only need the codes/labels.
export const CURRENCIES = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "MAD", label: "Moroccan Dirham" },
  { code: "TND", label: "Tunisian Dinar" },
  { code: "DZD", label: "Algerian Dinar" },
  { code: "EGP", label: "Egyptian Pound" },
  { code: "AED", label: "UAE Dirham" },
  { code: "SAR", label: "Saudi Riyal" },
  { code: "QAR", label: "Qatari Riyal" },
  { code: "CHF", label: "Swiss Franc" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "CNY", label: "Chinese Yuan" },
  { code: "INR", label: "Indian Rupee" },
  { code: "BRL", label: "Brazilian Real" },
  { code: "MXN", label: "Mexican Peso" },
  { code: "ZAR", label: "South African Rand" },
  { code: "TRY", label: "Turkish Lira" },
];

const formatterCache = new Map();

export function formatCurrency(value, currencyCode = "USD") {
  let formatter = formatterCache.get(currencyCode);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode,
      });
    } catch {
      formatter = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
      });
    }
    formatterCache.set(currencyCode, formatter);
  }
  return formatter.format(value || 0);
}
