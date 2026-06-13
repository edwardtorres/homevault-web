import type { Category, Item, Room } from "../types/inventory";
import { formatDate } from "./formatters";

const COLUMNS = [
  "Room",
  "Category",
  "Item Name",
  "Serial Number",
  "Estimated Value",
  "Notes",
  "Photo Path or URL",
  "Created Date",
  "Updated Date",
];

/** Wrap a field in quotes and escape embedded quotes per RFC 4180. */
function escapeCell(value: string | number): string {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Build the inventory CSV text from the in-memory data. */
export function buildInventoryCsv(
  rooms: Room[],
  categories: Category[],
  items: Item[]
): string {
  const roomById = new Map(rooms.map((r) => [r.id, r]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const rows = items.map((item) => {
    const room = roomById.get(item.room_id);
    const category = categoryById.get(item.category_id);
    return [
      room?.name ?? "",
      category?.name ?? "",
      item.name,
      item.serial_number,
      item.estimated_value,
      item.notes,
      item.photo_path ?? item.photo_url ?? "",
      formatDate(item.created_at),
      formatDate(item.updated_at),
    ]
      .map(escapeCell)
      .join(",");
  });

  return [COLUMNS.join(","), ...rows].join("\r\n");
}

/** Trigger a browser download of the CSV. */
export function downloadCsv(filename: string, csvText: string): void {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function csvFileName(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `HomeVault_Inventory_${stamp}.csv`;
}
