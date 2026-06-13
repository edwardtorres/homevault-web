import type { HTMLAttributes } from "react";

/** A flat, hard-bordered block — the Aretè equivalent of a card. */
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`border-2 border-ink ${className}`} {...props} />;
}
