import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Sparkles, Loader2, ArrowRight, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGES } from "../lib/translations";

export default function Login() {
  const { session, signIn, signUp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (session) router.replace("/dashboard");
  }, [session, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        router.replace("/dashboard");
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setInfo(t("login.confirmEmail"));
        setMode("signin");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 dark:bg-[#0d0d0d]">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <div className="flex rounded-2xl bg-surface p-1 shadow-soft dark:bg-[#1a1a19]">
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`rounded-xl px-2.5 py-1 text-xs font-medium transition ${
                lang === code
                  ? "bg-primary text-white dark:bg-white/10"
                  : "text-muted hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-2xl bg-surface text-muted shadow-soft transition hover:text-gray-900 dark:bg-[#1a1a19] dark:text-[#c3c2b7] dark:hover:text-white"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Moon className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-soft dark:bg-white/10">
            <Sparkles className="h-6 w-6 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {mode === "signin" ? t("login.welcomeBack") : t("login.createAccount")}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#c3c2b7]">
            {mode === "signin" ? t("login.signInSubtitle") : t("login.signUpSubtitle")}
          </p>
        </div>

        <div className="rounded-3xl bg-surface p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                {t("login.email")}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                {t("login.password")}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 disabled:opacity-60 dark:bg-white/10 dark:hover:bg-white/20"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? t("login.signIn") : t("login.createAccountBtn")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted dark:text-[#c3c2b7]">
          {mode === "signin" ? t("login.noAccount") : t("login.haveAccount")}{" "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setInfo("");
            }}
            className="font-medium text-primary hover:underline dark:text-white"
          >
            {mode === "signin" ? t("login.signUpLink") : t("login.signInLink")}
          </button>
        </p>
      </div>
    </div>
  );
}
