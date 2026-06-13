interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "decimal" | "numeric";
  textarea?: boolean;
  autoFocus?: boolean;
  required?: boolean;
}

export function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  textarea = false,
  autoFocus = false,
  required = false,
}: Props) {
  return (
    <label className="block">
      <span className="hv-label">
        {label}
        {required && <span className="text-clay"> *</span>}
      </span>
      {textarea ? (
        <textarea
          className="hv-input min-h-[72px] resize-y !text-base"
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="hv-input"
          type={type}
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
