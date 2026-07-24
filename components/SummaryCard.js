export default function SummaryCard({ label, value, icon: Icon, tone = "default" }) {
  const toneStyles = {
    default: "bg-primary text-white",
    positive: "bg-emerald-50 text-emerald-600",
    negative: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-2xl ${toneStyles[tone]}`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">
        {value}
      </p>
    </div>
  );
}
