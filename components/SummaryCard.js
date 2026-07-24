export default function SummaryCard({ label, value, icon: Icon, tone = "default" }) {
  const toneStyles = {
    default: "bg-primary text-white dark:bg-white/10",
    positive: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    negative: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  };

  return (
    <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-[#1a1a19]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted dark:text-[#c3c2b7]">{label}</span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-2xl ${toneStyles[tone]}`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
