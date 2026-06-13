import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PHOTO_BUCKET, supabase } from "../lib/supabaseClient";
import { buildDemoData } from "../lib/demoData";
import { resizeImage } from "../lib/imageHelpers";
import { useSession } from "./SessionContext";
import type {
  Category,
  Item,
  ItemInput,
  PhotoChange,
  Room,
} from "../types/inventory";

interface InventoryValue {
  loading: boolean;
  error: string | null;
  rooms: Room[];
  categories: Category[];
  items: Item[];
  refresh: () => Promise<void>;
  addRoom: (name: string) => Promise<void>;
  updateRoom: (id: string, name: string) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  addCategory: (roomId: string, name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addItem: (
    roomId: string,
    categoryId: string,
    input: ItemInput,
    photo: File | null
  ) => Promise<void>;
  updateItem: (
    id: string,
    input: ItemInput,
    photoChange: PhotoChange
  ) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const InventoryContext = createContext<InventoryValue | null>(null);

export function useInventory(): InventoryValue {
  const value = useContext(InventoryContext);
  if (!value) throw new Error("useInventory must be used within an InventoryProvider");
  return value;
}

const DEMO_STORAGE_KEY = "homevault-demo-state";

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  return crypto.randomUUID();
}

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Map a raw DB row to our Item shape (numeric coercion, photo_url default). */
function rowToItem(row: Record<string, unknown>): Item {
  return {
    id: String(row.id),
    user_id: (row.user_id as string) ?? null,
    room_id: String(row.room_id),
    category_id: String(row.category_id),
    name: (row.name as string) ?? "",
    serial_number: (row.serial_number as string) ?? "",
    estimated_value: Number(row.estimated_value ?? 0),
    notes: (row.notes as string) ?? "",
    photo_path: (row.photo_path as string) ?? null,
    photo_url: null,
    created_at: (row.created_at as string) ?? nowIso(),
    updated_at: (row.updated_at as string) ?? nowIso(),
  };
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { mode } = useSession();
  const isDemo = mode === "demo";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  // --- Demo persistence (session-only, localStorage) ------------------------
  const persistDemo = useCallback((r: Room[], c: Category[], i: Item[]) => {
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ rooms: r, categories: c, items: i }));
    } catch {
      /* storage may be unavailable; demo still works in memory */
    }
  }, []);

  // --- Authenticated load ---------------------------------------------------
  const loadAuthed = useCallback(async () => {
    if (!supabase) return;
    const { data: userData } = await supabase.auth.getUser();
    userIdRef.current = userData.user?.id ?? null;

    const [roomsRes, catsRes, itemsRes] = await Promise.all([
      supabase.from("rooms").select("*").order("created_at", { ascending: true }),
      supabase.from("categories").select("*").order("created_at", { ascending: true }),
      supabase.from("items").select("*").order("created_at", { ascending: true }),
    ]);

    if (roomsRes.error) throw roomsRes.error;
    if (catsRes.error) throw catsRes.error;
    if (itemsRes.error) throw itemsRes.error;

    const loadedItems = (itemsRes.data ?? []).map(rowToItem);
    await attachSignedUrls(loadedItems);

    setRooms((roomsRes.data ?? []) as Room[]);
    setCategories((catsRes.data ?? []) as Category[]);
    setItems(loadedItems);
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    if (isDemo) return; // demo state is the source of truth; nothing to refetch
    setLoading(true);
    try {
      await loadAuthed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load your inventory.");
    } finally {
      setLoading(false);
    }
  }, [isDemo, loadAuthed]);

  // Initial load whenever the mode changes.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    if (isDemo) {
      let snapshot;
      try {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY);
        snapshot = stored ? JSON.parse(stored) : buildDemoData();
      } catch {
        snapshot = buildDemoData();
      }
      if (!active) return;
      setRooms(snapshot.rooms);
      setCategories(snapshot.categories);
      setItems(snapshot.items);
      setLoading(false);
      return;
    }

    loadAuthed()
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "Failed to load inventory.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // --- Rooms ----------------------------------------------------------------
  const addRoom = async (name: string) => {
    if (isDemo) {
      const room: Room = { id: newId(), user_id: null, name, created_at: nowIso(), updated_at: nowIso() };
      const next = [...rooms, room];
      setRooms(next);
      persistDemo(next, categories, items);
      return;
    }
    if (!supabase) return;
    const { error } = await supabase.from("rooms").insert({ user_id: userIdRef.current, name });
    if (error) throw error;
    await refresh();
  };

  const updateRoom = async (id: string, name: string) => {
    if (isDemo) {
      const next = rooms.map((r) => (r.id === id ? { ...r, name, updated_at: nowIso() } : r));
      setRooms(next);
      persistDemo(next, categories, items);
      return;
    }
    if (!supabase) return;
    const { error } = await supabase.from("rooms").update({ name }).eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const deleteRoom = async (id: string) => {
    if (isDemo) {
      const nextRooms = rooms.filter((r) => r.id !== id);
      const nextCats = categories.filter((c) => c.room_id !== id);
      const nextItems = items.filter((i) => i.room_id !== id);
      setRooms(nextRooms);
      setCategories(nextCats);
      setItems(nextItems);
      persistDemo(nextRooms, nextCats, nextItems);
      return;
    }
    if (!supabase) return;
    await removePhotos(items.filter((i) => i.room_id === id));
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) throw error;
    await refresh();
  };

  // --- Categories -----------------------------------------------------------
  const addCategory = async (roomId: string, name: string) => {
    if (isDemo) {
      const cat: Category = { id: newId(), user_id: null, room_id: roomId, name, created_at: nowIso(), updated_at: nowIso() };
      const next = [...categories, cat];
      setCategories(next);
      persistDemo(rooms, next, items);
      return;
    }
    if (!supabase) return;
    const { error } = await supabase.from("categories").insert({ user_id: userIdRef.current, room_id: roomId, name });
    if (error) throw error;
    await refresh();
  };

  const updateCategory = async (id: string, name: string) => {
    if (isDemo) {
      const next = categories.map((c) => (c.id === id ? { ...c, name, updated_at: nowIso() } : c));
      setCategories(next);
      persistDemo(rooms, next, items);
      return;
    }
    if (!supabase) return;
    const { error } = await supabase.from("categories").update({ name }).eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const deleteCategory = async (id: string) => {
    if (isDemo) {
      const nextCats = categories.filter((c) => c.id !== id);
      const nextItems = items.filter((i) => i.category_id !== id);
      setCategories(nextCats);
      setItems(nextItems);
      persistDemo(rooms, nextCats, nextItems);
      return;
    }
    if (!supabase) return;
    await removePhotos(items.filter((i) => i.category_id === id));
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    await refresh();
  };

  // --- Items ----------------------------------------------------------------
  const addItem = async (
    roomId: string,
    categoryId: string,
    input: ItemInput,
    photo: File | null
  ) => {
    if (isDemo) {
      const id = newId();
      const photo_url = photo ? await fileToDataUrl(await resizeImage(photo)) : null;
      const item: Item = {
        id,
        user_id: null,
        room_id: roomId,
        category_id: categoryId,
        ...input,
        photo_path: null,
        photo_url,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      const next = [...items, item];
      setItems(next);
      persistDemo(rooms, categories, next);
      return;
    }
    if (!supabase) return;
    const userId = userIdRef.current;
    const { data: inserted, error } = await supabase
      .from("items")
      .insert({ user_id: userId, room_id: roomId, category_id: categoryId, ...input })
      .select("id")
      .single();
    if (error) throw error;

    const itemId = inserted.id as string;
    if (photo) {
      const path = `${userId}/${itemId}/photo.jpg`;
      const blob = await resizeImage(photo);
      const { error: upErr } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (!upErr) {
        await supabase.from("items").update({ photo_path: path }).eq("id", itemId);
      }
    }
    await refresh();
  };

  const updateItem = async (id: string, input: ItemInput, photoChange: PhotoChange) => {
    if (isDemo) {
      let photoUpdate: Partial<Item> = {};
      if (photoChange.type === "replace") {
        photoUpdate = { photo_url: await fileToDataUrl(await resizeImage(photoChange.file)) };
      } else if (photoChange.type === "remove") {
        photoUpdate = { photo_url: null, photo_path: null };
      }
      const next = items.map((i) =>
        i.id === id ? { ...i, ...input, ...photoUpdate, updated_at: nowIso() } : i
      );
      setItems(next);
      persistDemo(rooms, categories, next);
      return;
    }
    if (!supabase) return;
    const userId = userIdRef.current;
    const updates: Record<string, unknown> = { ...input };

    if (photoChange.type === "replace") {
      const path = `${userId}/${id}/photo.jpg`;
      const blob = await resizeImage(photoChange.file);
      const { error: upErr } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (!upErr) updates.photo_path = path;
    } else if (photoChange.type === "remove") {
      const existing = items.find((i) => i.id === id);
      if (existing?.photo_path) {
        await supabase.storage.from(PHOTO_BUCKET).remove([existing.photo_path]).catch(() => {});
      }
      updates.photo_path = null;
    }

    const { error } = await supabase.from("items").update(updates).eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const deleteItem = async (id: string) => {
    if (isDemo) {
      const next = items.filter((i) => i.id !== id);
      setItems(next);
      persistDemo(rooms, categories, next);
      return;
    }
    if (!supabase) return;
    const target = items.find((i) => i.id === id);
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) throw error;
    if (target?.photo_path) {
      await supabase.storage.from(PHOTO_BUCKET).remove([target.photo_path]).catch(() => {});
    }
    await refresh();
  };

  const clearAll = async () => {
    if (isDemo) {
      setRooms([]);
      setCategories([]);
      setItems([]);
      persistDemo([], [], []);
      return;
    }
    if (!supabase) return;
    await removePhotos(items);
    // Deleting rooms cascades to categories + items in the database.
    const { error } = await supabase.from("rooms").delete().eq("user_id", userIdRef.current);
    if (error) throw error;
    await refresh();
  };

  const value: InventoryValue = {
    loading,
    error,
    rooms,
    categories,
    items,
    refresh,
    addRoom,
    updateRoom,
    deleteRoom,
    addCategory,
    updateCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem,
    clearAll,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

// --- helpers that need the Supabase client --------------------------------
async function attachSignedUrls(loadedItems: Item[]): Promise<void> {
  if (!supabase) return;
  const withPhoto = loadedItems.filter((i) => i.photo_path);
  if (withPhoto.length === 0) return;
  const paths = withPhoto.map((i) => i.photo_path as string);
  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 3600);
  const urlByPath = new Map<string, string>();
  (data ?? []).forEach((entry) => {
    if (entry.path && entry.signedUrl) urlByPath.set(entry.path, entry.signedUrl);
  });
  loadedItems.forEach((i) => {
    if (i.photo_path) i.photo_url = urlByPath.get(i.photo_path) ?? null;
  });
}

async function removePhotos(targets: Item[]): Promise<void> {
  if (!supabase) return;
  const paths = targets.map((i) => i.photo_path).filter((p): p is string => Boolean(p));
  if (paths.length === 0) return;
  await supabase.storage.from(PHOTO_BUCKET).remove(paths).catch(() => {});
}
