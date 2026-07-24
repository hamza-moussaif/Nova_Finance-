import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  Calculator,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/loan-simulator", label: "Loan Simulator", icon: Calculator },
];

export default function Layout({ children }) {
  const { session, loading, signOut, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace("/login");
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
      </div>
    );
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="border-b border-gray-100 bg-surface p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:p-6">
        <div className="flex items-center gap-2 px-2 pb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary">
            <Wallet className="h-5 w-5 text-white" strokeWidth={1.75} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            Finly
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
                    ? "bg-primary text-white shadow-soft"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 hidden border-t border-gray-100 pt-4 md:block">
          <p className="truncate px-2 text-xs text-muted">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10">{children}</main>
    </div>
  );
}
