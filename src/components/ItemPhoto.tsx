type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-20 w-20",
};

function CameraGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-1/2 w-1/2 text-ink/40" aria-hidden="true">
      <path
        d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 19 8.5v9A1.5 1.5 0 0 1 17.5 19h-13A1.5 1.5 0 0 1 3 17.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="11" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

interface Props {
  url: string | null;
  alt: string;
  size?: Size;
}

export function ItemPhoto({ url, alt, size = "md" }: Props) {
  return (
    <div
      className={`${SIZES[size]} flex flex-none items-center justify-center overflow-hidden border-2 border-ink bg-ink/10`}
    >
      {url ? (
        <img src={url} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <CameraGlyph />
      )}
    </div>
  );
}
