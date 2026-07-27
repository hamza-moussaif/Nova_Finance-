import { useEffect, useState } from "react";
import { Check, Loader2, KeyRound, User, Download } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";
import { useTransactions } from "../lib/useTransactions";
import { CURRENCIES } from "../lib/currency";
import { buildTransactionsCsv, downloadCsv } from "../lib/exportCsv";
import { supabase } from "../lib/supabaseClient";

export default function Profile() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { transactions } = useTransactions();
  const [exporting, setExporting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoStatus, setInfoStatus] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setFullName(profile.full_name || "");
    setCurrency(profile.currency || "USD");
  }, [profile]);

  async function handleSaveInfo(e) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoStatus("");
    try {
      await updateProfile({ full_name: fullName, currency });
      setInfoStatus("saved");
    } catch {
      setInfoStatus("error");
    } finally {
      setSavingInfo(false);
    }
  }

  function handleExport() {
    setExporting(true);
    try {
      const csv = buildTransactionsCsv(transactions, profile.currency, lang);
      const filename = `nova-finance-bilan-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCsv(filename, csv);
    } finally {
      setExporting(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordStatus("");

    if (newPassword.length < 6) {
      setPasswordError(t("profile.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("profile.passwordMismatch"));
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordStatus("saved");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || t("profile.passwordError"));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {t("profile.title")}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-[#c3c2b7]">{t("profile.subtitle")}</p>
        </div>

        <div className="space-y-5">
          <form
            onSubmit={handleSaveInfo}
            className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]"
          >
            <div className="mb-5 flex items-center gap-2">
              <User className="h-4 w-4 text-muted dark:text-[#c3c2b7]" strokeWidth={1.75} />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t("profile.accountInfo")}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                  {t("profile.email")}
                </label>
                <input
                  value={user?.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-muted dark:border-[#2c2c2a] dark:bg-white/5 dark:text-[#c3c2b7]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                  {t("profile.fullName")}
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("profile.fullNamePlaceholder")}
                  className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                  {t("profile.currency")}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {profile.created_at && (
                <p className="text-xs text-muted dark:text-[#c3c2b7]">
                  {t("profile.memberSince")}{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              )}

              {infoStatus === "saved" && (
                <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {t("profile.infoSaved")}
                </p>
              )}
              {infoStatus === "error" && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  {t("profile.infoError")}
                </p>
              )}

              <button
                type="submit"
                disabled={savingInfo || loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 disabled:opacity-60 dark:bg-white/10 dark:hover:bg-white/20"
              >
                {savingInfo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {t("profile.saveInfo")}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
            <div className="mb-5 flex items-center gap-2">
              <Download className="h-4 w-4 text-muted dark:text-[#c3c2b7]" strokeWidth={1.75} />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t("profile.exportTitle")}
              </h2>
            </div>
            <p className="mb-5 text-sm text-muted dark:text-[#c3c2b7]">
              {t("profile.exportSubtitle")}
            </p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 disabled:opacity-60 dark:bg-white/10 dark:hover:bg-white/20"
            >
              <Download className="h-4 w-4" />
              {t("profile.exportButton")}
            </button>
          </div>

          <form
            onSubmit={handleChangePassword}
            className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]"
          >
            <div className="mb-5 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted dark:text-[#c3c2b7]" strokeWidth={1.75} />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t("profile.changePassword")}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                  {t("profile.newPassword")}
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                  {t("profile.confirmPassword")}
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-[#2c2c2a] dark:bg-white/5 dark:text-white"
                />
              </div>

              {passwordError && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  {passwordError}
                </p>
              )}
              {passwordStatus === "saved" && (
                <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {t("profile.passwordSaved")}
                </p>
              )}

              <button
                type="submit"
                disabled={savingPassword}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-medium text-white shadow-soft transition hover:bg-primary/90 disabled:opacity-60 dark:bg-white/10 dark:hover:bg-white/20"
              >
                {savingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    {t("profile.updatePassword")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
