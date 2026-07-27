// CSV opens natively in Excel, Google Sheets, and Numbers — no extra
// dependency needed to satisfy "download as CSV or Excel". Since CSV has no
// real typography, "organized" here means several clearly titled tables
// (summary, by category, by month, full ledger) separated by blank rows,
// each with its own header row — the closest CSV gets to a formatted report.
const LABELS = {
  en: {
    title: "NOVA FINANCE — FINANCIAL STATEMENT",
    generated: "Generated",
    currency: "Currency",
    period: "Period",
    noTransactions: "No transactions",
    summary: "SUMMARY",
    metric: "Metric",
    value: "Value",
    totalIncome: "Total income",
    totalExpenses: "Total expenses",
    netBalance: "Net balance",
    savingsRate: "Savings rate",
    transactionCount: "Number of transactions",
    byCategory: "EXPENSES BY CATEGORY",
    category: "Category",
    total: "Total",
    percentOfExpenses: "% of expenses",
    byMonth: "MONTHLY BREAKDOWN",
    month: "Month",
    income: "Income",
    expenses: "Expenses",
    net: "Net",
    ledger: "ALL TRANSACTIONS",
    date: "Date",
    name: "Name",
    type: "Type",
    amount: "Amount",
  },
  fr: {
    title: "NOVA FINANCE — RELEVÉ FINANCIER",
    generated: "Généré le",
    currency: "Devise",
    period: "Période",
    noTransactions: "Aucune transaction",
    summary: "RÉSUMÉ",
    metric: "Indicateur",
    value: "Valeur",
    totalIncome: "Total des revenus",
    totalExpenses: "Total des dépenses",
    netBalance: "Solde net",
    savingsRate: "Taux d'épargne",
    transactionCount: "Nombre de transactions",
    byCategory: "DÉPENSES PAR CATÉGORIE",
    category: "Catégorie",
    total: "Total",
    percentOfExpenses: "% des dépenses",
    byMonth: "RÉPARTITION MENSUELLE",
    month: "Mois",
    income: "Revenus",
    expenses: "Dépenses",
    net: "Net",
    ledger: "TOUTES LES TRANSACTIONS",
    date: "Date",
    name: "Nom",
    type: "Type",
    amount: "Montant",
  },
};

function escapeCsvField(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function monthLabel(dateStr, lang) {
  const d = new Date(dateStr);
  const label = d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildTransactionsCsv(transactions, currencyCode, lang = "en") {
  const L = LABELS[lang] || LABELS.en;
  const sorted = transactions.slice().sort((a, b) => a.date.localeCompare(b.date));

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

  const expensesByCategory = {};
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + Number(t.amount);
  }
  const categoryRows = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([category, total]) => [
      category,
      total.toFixed(2),
      totalExpenses > 0 ? `${((total / totalExpenses) * 100).toFixed(1)}%` : "0.0%",
    ]);

  const byMonth = {};
  for (const t of transactions) {
    const key = t.date.slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { income: 0, expenses: 0, key };
    if (t.type === "income") byMonth[key].income += Number(t.amount);
    else byMonth[key].expenses += Number(t.amount);
  }
  const monthRows = Object.values(byMonth)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ key, income, expenses }) => [
      monthLabel(`${key}-01`, lang),
      income.toFixed(2),
      expenses.toFixed(2),
      (income - expenses).toFixed(2),
    ]);

  const ledgerRows = sorted.map((t) => [t.date, t.name, t.type, t.category, Number(t.amount).toFixed(2)]);

  const today = new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US");
  const period =
    sorted.length > 0
      ? `${sorted[0].date} → ${sorted[sorted.length - 1].date}`
      : L.noTransactions;

  const lines = [
    [L.title],
    [`${L.generated}: ${today}`],
    [`${L.currency}: ${currencyCode}`],
    [`${L.period}: ${period}`],
    [],
    [L.summary],
    [L.metric, L.value],
    [L.totalIncome, `${totalIncome.toFixed(2)} ${currencyCode}`],
    [L.totalExpenses, `${totalExpenses.toFixed(2)} ${currencyCode}`],
    [L.netBalance, `${netBalance.toFixed(2)} ${currencyCode}`],
    [L.savingsRate, `${savingsRate.toFixed(1)}%`],
    [L.transactionCount, transactions.length],
    [],
    [L.byCategory],
    [L.category, L.total, L.percentOfExpenses],
    ...(categoryRows.length > 0 ? categoryRows : [[L.noTransactions, "", ""]]),
    [],
    [L.byMonth],
    [L.month, L.income, L.expenses, L.net],
    ...(monthRows.length > 0 ? monthRows : [[L.noTransactions, "", "", ""]]),
    [],
    [L.ledger],
    [L.date, L.name, L.type, L.category, `${L.amount} (${currencyCode})`],
    ...(ledgerRows.length > 0 ? ledgerRows : [[L.noTransactions, "", "", "", ""]]),
  ];

  return lines.map((line) => line.map(escapeCsvField).join(",")).join("\r\n");
}

export function downloadCsv(filename, csvContent) {
  // BOM so Excel detects UTF-8 correctly instead of mangling accented characters.
  const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
