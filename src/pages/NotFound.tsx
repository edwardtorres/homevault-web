import { Link } from "react-router-dom";

interface Props {
  label?: string;
  to?: string;
}

export function NotFound({ label = "Not found", to = "/" }: Props) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-16">
      <h1 className="text-4xl font-black uppercase tracking-tight">{label}</h1>
      <Link
        to={to}
        className="mt-4 inline-block text-xs font-extrabold uppercase tracking-[0.1em] underline"
      >
        Go back
      </Link>
    </div>
  );
}
