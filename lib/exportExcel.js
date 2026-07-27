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
    byMonthFullYear: "Expenses by month (full year)",
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
    byMonthFullYear: "Dépenses par mois (année complète)",
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

function styleCell(cell, { bold = false, fill = false } = {}) {
  cell.font = bold
    ? { name: FONT_NAME, size: FONT_SIZE, bold: true, color: fill ? HEADER_FONT_COLOR : undefined }
    : { name: FONT_NAME, size: FONT_SIZE };
  if (fill) cell.fill = HEADER_FILL;
  cell.border = ALL_BORDERS;
}

// Writes two tables starting on the same row, side by side, with a blank
// gap column between them — used to pair the two month-oriented tables.
function addSideBySideTables(sheet, left, right, gapCols = 1) {
  const leftStartCol = 1;
  const rightStartCol = leftStartCol + left.headers.length + gapCols;
  const startRow = sheet.rowCount + 1;
  const dataRowCount = Math.max(left.rows.length, right.rows.length);

  // Title row (merged across each table's own column span).
  sheet.mergeCells(startRow, leftStartCol, startRow, leftStartCol + left.headers.length - 1);
  const leftTitleCell = sheet.getCell(startRow, leftStartCol);
  leftTitleCell.value = left.title;
  leftTitleCell.font = { name: FONT_NAME, size: FONT_SIZE, bold: true };
  sheet.getRow(startRow).height = 20;

  sheet.mergeCells(startRow, rightStartCol, startRow, rightStartCol + right.headers.length - 1);
  const rightTitleCell = sheet.getCell(startRow, rightStartCol);
  rightTitleCell.value = right.title;
  rightTitleCell.font = { name: FONT_NAME, size: FONT_SIZE, bold: true };

  // Header row.
  const headerRowNum = startRow + 1;
  left.headers.forEach((h, i) => {
    const cell = sheet.getCell(headerRowNum, leftStartCol + i);
    cell.value = h;
    styleCell(cell, { bold: true, fill: true });
    cell.alignment = { vertical: "middle" };
  });
  right.headers.forEach((h, i) => {
    const cell = sheet.getCell(headerRowNum, rightStartCol + i);
    cell.value = h;
    styleCell(cell, { bold: true, fill: true });
    cell.alignment = { vertical: "middle" };
  });

  // Data rows.
  for (let r = 0; r < dataRowCount; r++) {
    const rowNum = headerRowNum + 1 + r;
    const leftRow = left.rows[r];
    if (leftRow) {
      leftRow.forEach((value, i) => {
        const cell = sheet.getCell(rowNum, leftStartCol + i);
        cell.value = value;
        styleCell(cell);
      });
    }
    const rightRow = right.rows[r];
    if (rightRow) {
      rightRow.forEach((value, i) => {
        const cell = sheet.getCell(rowNum, rightStartCol + i);
        cell.value = value;
        styleCell(cell);
      });
    }
  }

  sheet.addRow([]);
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

  // Everything lives on one sheet: Summary, By category, and the Ledger are
  // stacked full-width; the two monthly tables sit side by side. A blank row
  // separates each block, and every table keeps its own title/header/borders.
  const sheet = workbook.addWorksheet("Nova Finance");

  addTitleRow(sheet, L.title, 5);
  addDataRow(sheet, [`${L.generated}:`, generatedDate]);
  addDataRow(sheet, [`${L.currency}:`, currencyCode]);
  addDataRow(sheet, [`${L.period}:`, period]);
  sheet.addRow([]);

  // --- Summary table ---
  addTitleRow(sheet, L.summary, 5);
  addHeaderRow(sheet, [L.metric, L.value]);
  addDataRow(sheet, [L.totalIncome, `${totalIncome.toFixed(2)} ${currencyCode}`]);
  addDataRow(sheet, [L.totalExpenses, `${totalExpenses.toFixed(2)} ${currencyCode}`]);
  addDataRow(sheet, [L.netBalance, `${netBalance.toFixed(2)} ${currencyCode}`]);
  addDataRow(sheet, [L.savingsRate, `${savingsRate.toFixed(1)}%`]);
  addDataRow(sheet, [L.transactionCount, transactions.length]);
  sheet.addRow([]);

  // --- By category table ---
  const expensesByCategory = {};
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + Number(t.amount);
  }
  const categoryRows = Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a);
  addTitleRow(sheet, L.byCategory, 5);
  addHeaderRow(sheet, [L.category, `${L.total} (${currencyCode})`, L.percentOfExpenses]);
  if (categoryRows.length === 0) {
    addDataRow(sheet, [L.noTransactions, "", ""]);
  } else {
    for (const [category, total] of categoryRows) {
      addDataRow(sheet, [
        category,
        Number(total.toFixed(2)),
        totalExpenses > 0 ? `${((total / totalExpenses) * 100).toFixed(1)}%` : "0.0%",
      ]);
    }
  }
  sheet.addRow([]);

  // --- Monthly breakdown + expenses-by-month-for-the-year, side by side ---
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
      Number(income.toFixed(2)),
      Number(expenses.toFixed(2)),
      Number((income - expenses).toFixed(2)),
    ]);

  const currentYear = new Date().getFullYear();
  const expensesByYearMonth = Array.from({ length: 12 }, () => 0);
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const d = new Date(t.date);
    if (d.getFullYear() !== currentYear) continue;
    expensesByYearMonth[d.getMonth()] += Number(t.amount);
  }
  const fullYearRows = expensesByYearMonth.map((total, monthIndex) => [
    monthLabel(`${currentYear}-${String(monthIndex + 1).padStart(2, "0")}-01`, lang),
    Number(total.toFixed(2)),
  ]);

  addSideBySideTables(
    sheet,
    {
      title: L.byMonth,
      headers: [L.month, L.income, L.expenses, L.net],
      rows: monthRows.length > 0 ? monthRows : [[L.noTransactions, "", "", ""]],
    },
    {
      title: L.byMonthFullYear,
      headers: [L.month, `${L.expenses} (${currencyCode})`],
      rows: fullYearRows,
    }
  );

  // --- Full ledger table ---
  addTitleRow(sheet, L.ledger, 5);
  addHeaderRow(sheet, [L.date, L.name, L.type, L.category, `${L.amount} (${currencyCode})`]);
  if (sorted.length === 0) {
    addDataRow(sheet, [L.noTransactions, "", "", "", ""]);
  } else {
    for (const t of sorted) {
      addDataRow(sheet, [t.date, t.name, t.type, t.category, Number(Number(t.amount).toFixed(2))]);
    }
  }

  // Columns 1-5 carry the full-width tables (Summary/Category/Ledger); column
  // 5 doubles as the gap between the two side-by-side monthly tables, whose
  // right half sits in columns 6-7.
  styleSheet(sheet, [18, 28, 18, 18, 20, 18, 18]);

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
