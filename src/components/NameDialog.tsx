import { useState } from "react";
import { Button } from "./Button";
import { FormInput } from "./FormInput";
import { Modal } from "./Modal";

interface Props {
  title: string;
  label: string;
  initialValue?: string;
  confirmLabel?: string;
  onSubmit: (value: string) => void | Promise<void>;
  onCancel: () => void;
}

/** Small modal for creating / renaming a room or category. */
export function NameDialog({
  title,
  label,
  initialValue = "",
  confirmLabel = "Save",
  onSubmit,
  onCancel,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = value.trim();

  const submit = async () => {
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(trimmed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onCancel}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <FormInput label={label} value={value} onChange={setValue} autoFocus required />
        {error && <p className="mt-3 text-xs font-bold text-clay">{error}</p>}
        <div className="mt-6 flex gap-3">
          <Button type="submit" disabled={!trimmed || busy}>
            {busy ? "Saving…" : confirmLabel}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
