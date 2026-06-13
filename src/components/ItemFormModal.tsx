import { useEffect, useState } from "react";
import type { Item, ItemInput } from "../types/inventory";
import { Button } from "./Button";
import { FormInput } from "./FormInput";
import { Modal } from "./Modal";
import { PhotoUpload } from "./PhotoUpload";

interface Props {
  title: string;
  roomName: string;
  categoryName: string;
  color?: string;
  initial?: Item;
  onSave: (input: ItemInput, photo: { file: File | null; remove: boolean }) => Promise<void>;
  onClose: () => void;
}

export function ItemFormModal({
  title,
  roomName,
  categoryName,
  color,
  initial,
  onSave,
  onClose,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [serial, setSerial] = useState(initial?.serial_number ?? "");
  const [valueText, setValueText] = useState(
    initial ? String(initial.estimated_value) : ""
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up the object URL for a freshly selected file.
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const previewUrl = pendingFile
    ? localPreview
    : removed
    ? null
    : initial?.photo_url ?? null;

  const handleFile = (file: File) => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setPendingFile(file);
    setLocalPreview(URL.createObjectURL(file));
    setRemoved(false);
  };

  const handleRemove = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setPendingFile(null);
    setLocalPreview(null);
    setRemoved(true);
  };

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || busy) return;

    const parsed = parseFloat(valueText);
    const value = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;

    const input: ItemInput = {
      name: trimmed,
      serial_number: serial.trim(),
      estimated_value: value,
      notes: notes.trim(),
    };

    setBusy(true);
    setError(null);
    try {
      await onSave(input, { file: pendingFile, remove: removed });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the item.");
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose} color={color}>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <FormInput label="Item Name" value={name} onChange={setName} autoFocus required />
        <FormInput label="Serial Number" value={serial} onChange={setSerial} />
        <FormInput
          label="Estimated Value (USD)"
          value={valueText}
          onChange={setValueText}
          inputMode="decimal"
          placeholder="0"
        />

        <div className="border-2 border-ink/30 p-3 text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink/70">
          {roomName} · {categoryName}
        </div>

        <PhotoUpload previewUrl={previewUrl} onFile={handleFile} onRemove={handleRemove} />

        <FormInput label="Notes" value={notes} onChange={setNotes} textarea />

        {error && <p className="text-xs font-bold text-clay">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={!name.trim() || busy}>
            {busy ? "Saving…" : "Save Item"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
