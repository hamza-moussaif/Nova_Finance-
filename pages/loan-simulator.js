import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import Layout from "../components/Layout";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function computeLoan(principal, annualRatePercent, years) {
  const n = years * 12;
  const monthlyRate = annualRatePercent / 100 / 12;

  if (!principal || !n) {
    return { monthlyPayment: 0, totalPaid: 0, totalInterest: 0 };
  }

  // Zero-interest loans: straight-line amortization avoids a divide-by-zero.
  const monthlyPayment =
    monthlyRate === 0
      ? principal / n
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
        (Math.pow(1 + monthlyRate, n) - 1);

  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - principal;

  return { monthlyPayment, totalPaid, totalInterest };
}

export default function LoanSimulator() {
  const [amount, setAmount] = useState("20000");
  const [rate, setRate] = useState("5.5");
  const [years, setYears] = useState("5");

  const { monthlyPayment, totalPaid, totalInterest } = useMemo(
    () =>
      computeLoan(
        parseFloat(amount) || 0,
        parseFloat(rate) || 0,
        parseFloat(years) || 0
      ),
    [amount, rate, years]
  );

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Loan Simulator
          </h1>
          <p className="mt-1 text-sm text-muted">
            Instantly estimate a monthly payment. Nothing here is saved.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="mb-5 text-base font-semibold text-gray-900">
              Loan details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">
                  Loan amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">
                  Interest rate (annual %)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">
                  Duration (years)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full rounded-2xl border border-gray-100 bg-background px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-primary p-6 text-white shadow-soft">
            <div className="mb-5 flex items-center gap-2">
              <Calculator className="h-4 w-4" strokeWidth={1.75} />
              <h2 className="text-base font-semibold">Estimated payment</h2>
            </div>

            <p className="text-sm text-white/60">Monthly payment</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">
              {currency.format(monthlyPayment || 0)}
            </p>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Total paid</span>
                <span className="font-medium">{currency.format(totalPaid || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Total interest</span>
                <span className="font-medium">
                  {currency.format(totalInterest || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
