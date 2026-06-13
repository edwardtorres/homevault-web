import { useEffect, type ReactNode } from "react";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Optional background color (used to flood a modal with a room's color). */
  color?: string;
}

export function Modal({ title, onClose, children, color }: Props) {
  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto border-2 border-ink"
        style={{ background: color ?? "#E7E0D2" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-ink px-5 py-3">
          <h2 className="text-sm font-black uppercase tracking-[0.08em]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[11px] font-extrabold uppercase tracking-[0.1em] underline"
          >
            Close
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
