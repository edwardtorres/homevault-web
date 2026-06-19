interface Props {
  label: string;
  value: string;
  /** Extra classes for the card wrapper (e.g. grid column spans). */
  className?: string;
}

export function SummaryCard({ label, value, className = "" }: Props) {
  return (
    <div className={`border-2 border-ink p-4 ${className}`}>
      <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink/70">
        {label}
      </div>
      <div className="mt-1 truncate text-2xl font-black tabular-nums tracking-tight sm:text-3xl md:text-4xl">
        {value}
      </div>
    </div>
  );
}
