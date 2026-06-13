import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Whether the app has real Supabase credentials. When false (e.g. the public
 * GitHub Pages demo with no env configured) the app still runs in demo mode.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * The Supabase client, or null when not configured. Callers that need auth /
 * persistence must check for null and fall back to demo behavior.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

export const PHOTO_BUCKET = "item-photos";
