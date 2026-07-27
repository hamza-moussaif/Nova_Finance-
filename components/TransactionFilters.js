import { Search, X } from "lucide-react";
import { CATEGORY_NAMES } from "../lib/categories";
import { useLanguage } from "../context/LanguageContext";

export default function TransactionFilters({ filters, onChange }) {
  const { t } = useLanguage();

  function set(field, value) {
    onChange({ ...filters, [field]: value });
  }

  function clear() {
    onChange({ search: "", type: "all", category: "all", from: "", to: "" });
  }

  const hasActiveFilters =
    filters.search || filters.type !== "all" || filters.category !== "all" || filters.from || filters.to;

  return (
    <div className="mb-5 rounded-3xl bg-surface p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-[#c3c2b7]" strokeWidth={1.75} />
          <input
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder={t("filters.search")}
            className="w-full rounded-2xl border border-gray-100 bg-background py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
          />
        </div>

        <select
          value={filters.type}
          onChange={(e) => set("type", e.target.value)}
          className="rounded-2xl border border-gray-100 bg-background px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
        >
          <option value="all">{t("filters.allTypes")}</option>
          <option value="income">{t("form.income")}</option>
          <option value="expense">{t("form.expense")}</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => set("category", e.target.value)}
          className="rounded-2xl border border-gray-100 bg-background px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
        >
          <option value="all">{t("filters.allCategories")}</option>
          {CATEGORY_NAMES.map((c) => (
            <option key={c} value={c}>
              {t(`categories.${c}`)}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.from}
          onChange={(e) => set("from", e.target.value)}
          className="rounded-2xl border border-gray-100 bg-background px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
        />
        <span className="text-sm text-muted dark:text-[#c3c2b7]">{t("filters.to")}</span>
        <input
          type="date"
          value={filters.to}
          onChange={(e) => set("to", e.target.value)}
          className="rounded-2xl border border-gray-100 bg-background px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
        />

        {hasActiveFilters && (
          <button
            onClick={clear}
            className="flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-medium text-muted transition hover:text-gray-900 dark:text-[#c3c2b7] dark:hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
            {t("filters.clear")}
          </button>
        )}
      </div>
    </div>
  );
}
