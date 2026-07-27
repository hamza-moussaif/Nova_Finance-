// CSV opens natively in Excel, Google Sheets, and Numbers — no extra
// dependency needed to satisfy "download as CSV or Excel".
function escapeCsvField(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildTransactionsCsv(transactions, currencyCode) {
  const header = ["Date", "Name", "Type", "Category", `Amount (${currencyCode})`];
  const rows = transactions
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => [t.date, t.name, t.type, t.category, t.amount]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const lines = [
    header,
    ...rows,
    [],
    ["Total income", "", "", "", totalIncome.toFixed(2)],
    ["Total expenses", "", "", "", totalExpenses.toFixed(2)],
    ["Net balance", "", "", "", (totalIncome - totalExpenses).toFixed(2)],
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
