interface Props {
  label: string;
  value: string;
}

export function SummaryCard({ label, value }: Props) {
  return (
    <div className="border-2 border-ink p-4">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink/70">
        {label}
      </div>
      <div className="mt-1 text-3xl font-black tracking-tight md:text-4xl">{value}</div>
    </div>
  );
}
