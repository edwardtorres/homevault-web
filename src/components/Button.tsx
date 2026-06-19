import type { ButtonHTMLAttributes } from "react";

type Variant = "solid" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
  solid: "bg-ink text-bone border-ink hover:bg-ink/90",
  ghost: "bg-transparent text-ink border-ink hover:bg-ink/10",
  danger: "bg-clay text-bone border-clay hover:bg-clay/90",
};

export function Button({ variant = "solid", className = "", ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border-2
        px-5 py-3 text-xs font-extrabold uppercase tracking-[0.08em] transition active:scale-[0.98]
        disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
