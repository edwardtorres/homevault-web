// Core data shapes for HomeVault, shared by the demo and Supabase data layers.

export interface Room {
  id: string;
  user_id: string | null;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  room_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  user_id: string | null;
  room_id: string;
  category_id: string;
  name: string;
  serial_number: string;
  estimated_value: number;
  notes: string;
  /** Storage path in the `item-photos` bucket (auth mode), or null. */
  photo_path: string | null;
  /** Resolved, displayable URL (signed URL in auth mode, object URL in demo). */
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalRooms: number;
  totalCategories: number;
  totalItems: number;
  totalValue: number;
}

/** Fields collected by the add/edit item form. */
export interface ItemInput {
  name: string;
  serial_number: string;
  estimated_value: number;
  notes: string;
}

/** Describes what should happen to an item's photo when saving an edit. */
export type PhotoChange =
  | { type: "keep" }
  | { type: "replace"; file: File }
  | { type: "remove" };

/** A flattened item joined with its room + category, used by search. */
export interface ItemWithContext {
  item: Item;
  room: Room;
  category: Category;
}
