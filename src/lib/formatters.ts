const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const currencyPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Whole-dollar currency, e.g. "$8,400". Used for big summary numbers. */
export function formatMoney(value: number): string {
  return currency.format(Number.isFinite(value) ? value : 0);
}

/** Two-decimal currency, e.g. "$1,200.00". Used for per-item detail. */
export function formatMoneyPrecise(value: number): string {
  return currencyPrecise.format(Number.isFinite(value) ? value : 0);
}

/** Short date, e.g. "Jun 12, 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Pluralizing count helper, e.g. countLabel(1, "item") => "1 item". */
export function countLabel(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}
