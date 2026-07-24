import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Sparkles,
  LayoutDashboard,
  ArrowLeftRight,
  Calculator,
  PieChart,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGES } from "../lib/translations";

export default function Layout({ children }) {
  const { session, loading, signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  const NAV_ITEMS = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/transactions", label: t("nav.transactions"), icon: ArrowLeftRight },
    { href: "/budgets", label: t("nav.budgets"), icon: PieChart },
    { href: "/loan-simulator", label: t("nav.loanSimulator"), icon: Calculator },
  ];

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background dark:bg-[#0d0d0d]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary dark:border-[#2c2c2a] dark:border-t-white" />
      </div>
    );
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#0d0d0d] md:flex">
      <aside className="border-b border-gray-100 bg-surface p-4 dark:border-[#2c2c2a] dark:bg-[#1a1a19] md:min-h-screen md:w-64 md:border-b-0 md:border-r md:p-6">
        <div className="flex items-center gap-2 px-2 pb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary dark:bg-white/10">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={1.75} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            {t("appName")}
          </span>
        </div>

        <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-primary text-white shadow-soft dark:bg-white/10"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-[#c3c2b7] dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 flex items-center gap-2 px-2">
          <div className="flex rounded-2xl bg-background p-1 dark:bg-white/5">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`rounded-xl px-2.5 py-1 text-xs font-medium transition ${
                  lang === code
                    ? "bg-primary text-white dark:bg-white/10 dark:text-white"
                    : "text-muted hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-2xl bg-background text-muted transition hover:text-gray-900 dark:bg-white/5 dark:text-[#c3c2b7] dark:hover:text-white"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </div>

        <div className="mt-6 hidden border-t border-gray-100 pt-4 dark:border-[#2c2c2a] md:block">
          <p className="truncate px-2 text-xs text-muted">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 dark:text-[#c3c2b7] dark:hover:bg-white/5 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            {t("nav.signOut")}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10">{children}</main>
    </div>
  );
}
