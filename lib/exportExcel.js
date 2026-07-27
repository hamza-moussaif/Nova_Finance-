// Real spreadsheet tables (column widths, borders, header shading) aren't
// possible in plain CSV — this builds an actual .xlsx workbook instead, one
// worksheet per table, all cells sharing the same font size so nothing looks
// inconsistent across the file. exceljs is loaded dynamically so its cost
// only lands on the user who actually clicks "export", not on first page load.
const FONT_NAME = "Calibri";
const FONT_SIZE = 11;
const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
const HEADER_FONT_COLOR = { argb: "FFFFFFFF" };
const THIN_BORDER = { style: "thin", color: { argb: "FFD0D4DA" } };
const ALL_BORDERS = { top: THIN_BORDER, left: THIN_BORDER, bottom: THIN_BORDER, right: THIN_BORDER };

const LABELS = {
  en: {
    title: "Nova Finance — Financial Statement",
    generated: "Generated",
    currency: "Currency",
    period: "Period",
    noTransactions: "No transactions",
    summary: "Summary",
    metric: "Metric",
    value: "Value",
    totalIncome: "Total income",
    totalExpenses: "Total expenses",
    netBalance: "Net balance",
    savingsRate: "Savings rate",
    transactionCount: "Number of transactions",
    byCategory: "Expenses by category",
    category: "Category",
    total: "Total",
    percentOfExpenses: "% of expenses",
    byMonth: "Monthly breakdown",
    month: "Month",
    income: "Income",
    expenses: "Expenses",
    net: "Net",
    ledger: "All transactions",
    date: "Date",
    name: "Name",
    type: "Type",
    amount: "Amount",
  },
  fr: {
    title: "Nova Finance — Relevé financier",
    generated: "Généré le",
    currency: "Devise",
    period: "Période",
    noTransactions: "Aucune transaction",
    summary: "Résumé",
    metric: "Indicateur",
    value: "Valeur",
    totalIncome: "Total des revenus",
    totalExpenses: "Total des dépenses",
    netBalance: "Solde net",
    savingsRate: "Taux d'épargne",
    transactionCount: "Nombre de transactions",
    byCategory: "Dépenses par catégorie",
    category: "Catégorie",
    total: "Total",
    percentOfExpenses: "% des dépenses",
    byMonth: "Répartition mensuelle",
    month: "Mois",
    income: "Revenus",
    expenses: "Dépenses",
    net: "Net",
    ledger: "Toutes les transactions",
    date: "Date",
    name: "Nom",
    type: "Type",
    amount: "Montant",
  },
};

function monthLabel(dateStr, lang) {
  const d = new Date(dateStr);
  const label = d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function styleSheet(sheet, columnWidths) {
  sheet.columns = columnWidths.map((width) => ({ width }));
  sheet.eachRow((row) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      if (!cell.font) cell.font = { name: FONT_NAME, size: FONT_SIZE };
    });
  });
}

function addTitleRow(sheet, text, span) {
  const row = sheet.addRow([text]);
  sheet.mergeCells(row.number, 1, row.number, span);
  row.getCell(1).font = { name: FONT_NAME, size: FONT_SIZE, bold: true };
  row.height = 20;
  return row;
}

function addHeaderRow(sheet, headers) {
  const row = sheet.addRow(headers);
  row.eachCell((cell) => {
    cell.font = { name: FONT_NAME, size: FONT_SIZE, bold: true, color: HEADER_FONT_COLOR };
    cell.fill = HEADER_FILL;
    cell.border = ALL_BORDERS;
    cell.alignment = { vertical: "middle" };
  });
  return row;
}

function addDataRow(sheet, values) {
  const row = sheet.addRow(values);
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { name: FONT_NAME, size: FONT_SIZE };
    cell.border = ALL_BORDERS;
  });
  return row;
}

export async function downloadFinancialStatement(transactions, currencyCode, lang, filename) {
  const ExcelJS = (await import("exceljs")).default;
  const L = LABELS[lang] || LABELS.en;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Nova Finance";
  workbook.created = new Date();

  const sorted = transactions.slice().sort((a, b) => a.date.localeCompare(b.date));

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

  const period =
    sorted.length > 0 ? `${sorted[0].date} → ${sorted[sorted.length - 1].date}` : L.noTransactions;
  const generatedDate = new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US");

  // --- Summary sheet ---
  const summarySheet = workbook.addWorksheet(L.summary);
  addTitleRow(summarySheet, L.title, 2);
  addDataRow(summarySheet, [`${L.generated}:`, generatedDate]);
  addDataRow(summarySheet, [`${L.currency}:`, currencyCode]);
  addDataRow(summarySheet, [`${L.period}:`, period]);
  summarySheet.addRow([]);
  addHeaderRow(summarySheet, [L.metric, L.value]);
  addDataRow(summarySheet, [L.totalIncome, `${totalIncome.toFixed(2)} ${currencyCode}`]);
  addDataRow(summarySheet, [L.totalExpenses, `${totalExpenses.toFixed(2)} ${currencyCode}`]);
  addDataRow(summarySheet, [L.netBalance, `${netBalance.toFixed(2)} ${currencyCode}`]);
  addDataRow(summarySheet, [L.savingsRate, `${savingsRate.toFixed(1)}%`]);
  addDataRow(summarySheet, [L.transactionCount, transactions.length]);
  styleSheet(summarySheet, [28, 24]);

  // --- By category sheet ---
  const categorySheet = workbook.addWorksheet(L.byCategory.slice(0, 31));
  const expensesByCategory = {};
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + Number(t.amount);
  }
  const categoryRows = Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a);
  addTitleRow(categorySheet, L.byCategory, 3);
  addHeaderRow(categorySheet, [L.category, `${L.total} (${currencyCode})`, L.percentOfExpenses]);
  if (categoryRows.length === 0) {
    addDataRow(categorySheet, [L.noTransactions, "", ""]);
  } else {
    for (const [category, total] of categoryRows) {
      addDataRow(categorySheet, [
        category,
        Number(total.toFixed(2)),
        totalExpenses > 0 ? `${((total / totalExpenses) * 100).toFixed(1)}%` : "0.0%",
      ]);
    }
  }
  styleSheet(categorySheet, [22, 18, 16]);

  // --- By month sheet ---
  const monthSheet = workbook.addWorksheet(L.byMonth.slice(0, 31));
  const byMonth = {};
  for (const t of transactions) {
    const key = t.date.slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { income: 0, expenses: 0, key };
    if (t.type === "income") byMonth[key].income += Number(t.amount);
    else byMonth[key].expenses += Number(t.amount);
  }
  const monthRows = Object.values(byMonth).sort((a, b) => a.key.localeCompare(b.key));
  addTitleRow(monthSheet, L.byMonth, 4);
  addHeaderRow(monthSheet, [L.month, L.income, L.expenses, L.net]);
  if (monthRows.length === 0) {
    addDataRow(monthSheet, [L.noTransactions, "", "", ""]);
  } else {
    for (const { key, income, expenses } of monthRows) {
      addDataRow(monthSheet, [
        monthLabel(`${key}-01`, lang),
        Number(income.toFixed(2)),
        Number(expenses.toFixed(2)),
        Number((income - expenses).toFixed(2)),
      ]);
    }
  }
  styleSheet(monthSheet, [20, 16, 16, 16]);

  // --- Full ledger sheet ---
  const ledgerSheet = workbook.addWorksheet(L.ledger.slice(0, 31));
  addTitleRow(ledgerSheet, L.ledger, 5);
  addHeaderRow(ledgerSheet, [L.date, L.name, L.type, L.category, `${L.amount} (${currencyCode})`]);
  if (sorted.length === 0) {
    addDataRow(ledgerSheet, [L.noTransactions, "", "", "", ""]);
  } else {
    for (const t of sorted) {
      addDataRow(ledgerSheet, [t.date, t.name, t.type, t.category, Number(Number(t.amount).toFixed(2))]);
    }
  }
  ledgerSheet.views = [{ state: "frozen", ySplit: 2 }];
  styleSheet(ledgerSheet, [14, 28, 12, 18, 18]);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
