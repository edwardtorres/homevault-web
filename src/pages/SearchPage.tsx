import { useMemo, useState } from "react";
import { useInventory } from "../context/InventoryContext";
import { EmptyState } from "../components/EmptyState";
import { ItemResultRow } from "../components/ItemResultRow";
import { PageLoading } from "./DashboardPage";

export function SearchPage() {
  const { rooms, categories, items, loading } = useInventory();
  const [query, setQuery] = useState("");

  const roomById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const room = roomById.get(item.room_id);
      const category = categoryById.get(item.category_id);
      const haystack = [
        item.name,
        item.serial_number,
        item.notes,
        category?.name ?? "",
        room?.name ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, items, roomById, categoryById]);

  if (loading) return <PageLoading />;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8">
      <h1 className="text-5xl font-black uppercase tracking-tight sm:text-6xl">Search</h1>
      <p className="mt-3 text-sm font-bold text-ink/60">
        Find items by name, room, category, serial number, or notes.
      </p>

      <div className="mt-6">
        <input
          className="hv-input !text-2xl"
          placeholder="Search inventory…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState
            title="No items yet"
            message="Add items to your inventory, then search for them here."
          />
        ) : results.length === 0 ? (
          <EmptyState
            title="No matches"
            message="Try a different name, room, category, or serial number."
          />
        ) : (
          <div className="border-t-2 border-ink">
            {results.map((item) => (
              <ItemResultRow
                key={item.id}
                item={item}
                room={roomById.get(item.room_id)}
                category={categoryById.get(item.category_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
