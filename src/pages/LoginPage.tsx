import { useState } from "react";
import { useSession } from "../context/SessionContext";
import { Button } from "../components/Button";
import { FormInput } from "../components/FormInput";

export function LoginPage() {
  const { signIn, signUp, enterDemo, supabaseConfigured } = useSession();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
        setInfo(
          "Account created. If email confirmation is enabled in Supabase, confirm via the link, then sign in."
        );
        setIsSignUp(false);
      } else {
        await signIn(email.trim(), password);
        // On success the session listener switches the app to the dashboard.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-lg font-black uppercase tracking-[0.18em]">HomeVault</span>
      </div>
      <div className="hv-rule" />

      <div className="mx-auto w-full max-w-xl px-5 py-12 sm:py-16">
        <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl">
          Home
          <br />
          Vault
        </h1>
        <p className="mt-5 text-base font-bold text-ink/70">
          A simple home inventory dashboard.
        </p>

        <div className="mt-10 border-2 border-ink p-6">
          {!supabaseConfigured && (
            <p className="mb-5 border-2 border-dashed border-ink/40 p-3 text-xs font-bold text-ink/70">
              Account sign-in isn't configured for this deployment. Use{" "}
              <span className="underline">View Demo</span> below to explore the app.
            </p>
          )}

          <form className="space-y-5" onSubmit={submit}>
            <FormInput
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="you@example.com"
            />
            <FormInput
              label="Password"
              value={password}
              onChange={setPassword}
              type="password"
              placeholder="••••••••"
            />

            {error && <p className="text-xs font-bold text-clay">{error}</p>}
            {info && <p className="text-xs font-bold text-teal">{info}</p>}

            <Button type="submit" className="w-full" disabled={busy || !supabaseConfigured}>
              {busy ? "Please wait…" : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <button
            className="mt-4 text-xs font-extrabold uppercase tracking-[0.08em] underline"
            onClick={() => {
              setIsSignUp((v) => !v);
              setError(null);
              setInfo(null);
            }}
          >
            {isSignUp ? "Have an account? Sign In" : "Need an account? Sign Up"}
          </button>
        </div>

        <div className="mt-8">
          <Button variant="ghost" className="w-full" onClick={enterDemo}>
            View Demo
          </Button>
          <p className="mt-3 text-center text-xs font-bold text-ink/60">
            Demo mode lets you explore sample inventory data without creating an account.
          </p>
        </div>
      </div>
    </div>
  );
}
