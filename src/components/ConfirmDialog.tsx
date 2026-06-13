import { Button } from "./Button";
import { Modal } from "./Modal";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  destructive = true,
}: Props) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm font-semibold leading-relaxed text-ink/80">{message}</p>
      <div className="mt-6 flex gap-3">
        <Button variant={destructive ? "danger" : "solid"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
