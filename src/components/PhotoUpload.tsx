import { useRef } from "react";
import { ItemPhoto } from "./ItemPhoto";

interface Props {
  previewUrl: string | null;
  onFile: (file: File) => void;
  onRemove: () => void;
}

const smallButton =
  "rounded-lg border-2 border-ink px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] hover:bg-ink/10";

export function PhotoUpload({ previewUrl, onFile, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <span className="hv-label">Item Photo</span>
      <div className="flex items-center gap-4">
        <ItemPhoto url={previewUrl} alt="Item photo preview" size="lg" />
        <div className="flex flex-col items-start gap-2">
          <button type="button" className={smallButton} onClick={() => inputRef.current?.click()}>
            {previewUrl ? "Replace" : "Choose Photo"}
          </button>
          {previewUrl && (
            <button type="button" className={smallButton} onClick={onRemove}>
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
