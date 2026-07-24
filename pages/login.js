import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Wallet, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { session, signIn, signUp } = useAuth();
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
        setInfo("Account created. Check your inbox to confirm your email, then sign in.");
        setMode("signin");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-soft">
            <Wallet className="h-6 w-6 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {mode === "signin"
              ? "Sign in to keep tracking your finances."
              : "Start tracking your finances in minutes."}
          </p>
        </div>

        <div className="rounded-3xl bg-surface p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setInfo("");
            }}
            className="font-medium text-primary hover:underline"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
