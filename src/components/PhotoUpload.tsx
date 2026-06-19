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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  };

  return (
    <div>
      <span className="hv-label">Item Photo</span>
      <div className="flex items-center gap-4">
        <ItemPhoto url={previewUrl} alt="Item photo preview" size="lg" />
        <div className="flex flex-col items-start gap-2">
          <button
            type="button"
            className={smallButton}
            onClick={() => cameraInputRef.current?.click()}
          >
            {previewUrl ? "Retake Photo" : "Take Photo"}
          </button>
          <button
            type="button"
            className={smallButton}
            onClick={() => libraryInputRef.current?.click()}
          >
            Choose From Library
          </button>
          {previewUrl && (
            <button type="button" className={smallButton} onClick={onRemove}>
              Remove
            </button>
          )}
        </div>
      </div>
      {/* Camera capture: opens the device camera on mobile, falls back to the
          file picker on desktop where no camera capture is available. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      {/* Library / file picker. */}
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
