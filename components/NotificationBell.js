import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, Info } from "lucide-react";
import { useNotifications } from "../lib/useNotifications";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";
import { formatCurrency } from "../lib/currency";

function renderMessage(item, t, currency) {
  switch (item.type) {
    case "budget":
      return t("notifications.budgetOver")
        .replace("{category}", t(`categories.${item.data.category}`))
        .replace("{amount}", formatCurrency(item.data.over, currency));
    case "goalOverdue":
      return t("notifications.goalOverdue").replace("{name}", item.data.name);
    case "goalDeadline":
      return item.data.days === 0
        ? t("notifications.goalDeadlineToday").replace("{name}", item.data.name)
        : t("notifications.goalDeadline").replace("{name}", item.data.name).replace("{days}", item.data.days);
    case "recurringDue":
      return item.data.days === 0
        ? t("notifications.recurringDueToday").replace("{name}", item.data.name)
        : t("notifications.recurringDue").replace("{name}", item.data.name).replace("{days}", item.data.days);
    case "tripUpcoming":
      return item.data.days === 0
        ? t("notifications.tripToday").replace("{name}", item.data.name)
        : t("notifications.tripUpcoming").replace("{name}", item.data.name).replace("{days}", item.data.days);
    default:
      return "";
  }
}

export default function NotificationBell() {
  const { t } = useLanguage();
  const { profile } = useProfile();
  const { notifications, loading } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const hasWarning = notifications.some((n) => n.severity === "warning");

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-8 w-8 items-center justify-center rounded-2xl bg-background text-muted transition hover:text-gray-900 dark:bg-white/5 dark:text-[#c3c2b7] dark:hover:text-white"
        aria-label={t("notifications.title")}
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {notifications.length > 0 && (
          <span
            className={`absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-white ${
              hasWarning ? "bg-rose-500" : "bg-primary dark:bg-white/40"
            }`}
          >
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>

      {/* Mobile-only dimmed backdrop: taps anywhere outside the panel close it,
          and it signals the panel is a floating overlay rather than page content. */}
      <div
        className={`fixed inset-0 z-10 bg-black/20 transition-opacity sm:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      {/* Fixed + inset-margined on mobile so it can never overflow the viewport
          regardless of where the bell sits; anchored to the bell from `sm:` up. */}
      <div
        aria-hidden={!open}
        className={`fixed inset-x-4 top-20 z-20 origin-top rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition duration-150 ease-out dark:border-[#2c2c2a] dark:bg-[#1a1a19] sm:absolute sm:inset-x-auto sm:left-0 sm:top-10 sm:w-80 ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <p className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white">
          {t("notifications.title")}
        </p>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <p className="px-3 py-4 text-center text-sm text-muted dark:text-[#c3c2b7]">
              {t("transactions.loading")}
            </p>
          ) : notifications.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted dark:text-[#c3c2b7]">
              {t("notifications.empty")}
            </p>
          ) : (
            <ul className="space-y-1">
              {notifications.map((item) => {
                const Icon = item.severity === "warning" ? AlertTriangle : Info;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm transition hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <Icon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          item.severity === "warning" ? "text-rose-500" : "text-primary dark:text-white/60"
                        }`}
                        strokeWidth={1.75}
                      />
                      <span className="text-gray-900 dark:text-white">
                        {renderMessage(item, t, profile.currency)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
