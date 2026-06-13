import type { ReactNode } from "react";

interface Props {
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ title, message, action }: Props) {
  return (
    <div className="border-2 border-dashed border-ink/50 p-8 text-center sm:p-12">
      <h3 className="text-2xl font-black uppercase tracking-tight">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-ink/70">{message}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
