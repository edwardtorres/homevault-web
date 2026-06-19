import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

export type SessionMode = "loading" | "guest" | "authed" | "demo";

interface SessionValue {
  mode: SessionMode;
  userEmail: string | null;
  supabaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  enterDemo: () => void;
  exitDemo: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used within a SessionProvider");
  return value;
}

const DEMO_FLAG = "hv-demo";

export function SessionProvider({ children }: { children: ReactNode }) {
  // Remember demo mode across reloads so a refresh doesn't bounce a demo
  // visitor back to the login screen.
  const [mode, setMode] = useState<SessionMode>(() =>
    sessionStorage.getItem(DEMO_FLAG) === "1" ? "demo" : "loading"
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!supabase) {
      // No backend configured — the app runs in demo-only mode.
      // Don't kick a visitor out of an active demo session.
      setMode((prev) => (prev === "demo" ? "demo" : "guest"));
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        setUserEmail(data.session.user.email ?? null);
        setMode("authed");
      } else {
        // Preserve an active demo session if getSession resolves after the
        // visitor has already tapped "View Demo".
        setMode((prev) => (prev === "demo" ? "demo" : "guest"));
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) {
        setUserEmail(session.user.email ?? null);
        setMode("authed");
      } else {
        setUserEmail(null);
        // Don't kick a visitor out of demo mode on a sign-out event.
        setMode((prev) => (prev === "demo" ? "demo" : "guest"));
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUserEmail(null);
    setMode("guest");
  };

  const enterDemo = () => {
    sessionStorage.setItem(DEMO_FLAG, "1");
    setMode("demo");
  };
  const exitDemo = () => {
    sessionStorage.removeItem(DEMO_FLAG);
    setMode("guest");
  };

  const value: SessionValue = {
    mode,
    userEmail,
    supabaseConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    enterDemo,
    exitDemo,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
