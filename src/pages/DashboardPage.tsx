import { Link, useNavigate } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import { SummaryCard } from "../components/SummaryCard";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/Button";
import { ItemResultRow } from "../components/ItemResultRow";
import { dashboardStats, sumValue } from "../lib/stats";
import { formatMoney, countLabel } from "../lib/formatters";
import { roomColor } from "../lib/theme";

export function DashboardPage() {
  const { rooms, categories, items, loading } = useInventory();
  const navigate = useNavigate();

  if (loading) {
    return <PageLoading />;
  }

  const stats = dashboardStats(rooms, categories, items);
  const roomById = new Map(rooms.map((r) => [r.id, r]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const recentItems = [...items]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8">
      <h1 className="text-5xl font-black uppercase tracking-tight sm:text-6xl">Dashboard</h1>
      <p className="mt-3 text-sm font-bold text-ink/60">
        Your home inventory at a glance.
      </p>

      {rooms.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No rooms yet"
            message="Create your first room to start building your inventory."
            action={<Button onClick={() => navigate("/rooms")}>Add Room</Button>}
          />
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <SummaryCard label="Rooms" value={String(stats.totalRooms)} />
            <SummaryCard label="Categories" value={String(stats.totalCategories)} />
            <SummaryCard label="Items" value={String(stats.totalItems)} />
            <SummaryCard label="Total Value" value={formatMoney(stats.totalValue)} />
          </div>

          {recentItems.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-black uppercase tracking-tight">Recent Items</h2>
              <div className="mt-3 border-t-2 border-ink">
                {recentItems.map((item) => (
                  <ItemResultRow
                    key={item.id}
                    item={item}
                    room={roomById.get(item.room_id)}
                    category={categoryById.get(item.category_id)}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="mt-12">
            <h2 className="text-xl font-black uppercase tracking-tight">Rooms</h2>
            <div className="mt-3 border-t-2 border-ink">
              {rooms.map((room) => {
                const roomItems = items.filter((i) => i.room_id === room.id);
                const roomCats = categories.filter((c) => c.room_id === room.id);
                return (
                  <Link
                    key={room.id}
                    to={`/rooms/${room.id}`}
                    className="flex items-center gap-4 border-b-2 border-ink/15 py-4 transition-colors hover:bg-ink/5"
                  >
                    <span
                      className="h-5 w-5 flex-none border-2 border-ink"
                      style={{ background: roomColor(room.id) }}
                    />
                    <span className="flex-1 truncate text-lg font-black uppercase tracking-tight">
                      {room.name}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink/60">
                      {countLabel(roomCats.length, "category")} · {countLabel(roomItems.length, "item")}
                    </span>
                    <span className="ml-2 text-sm font-black">
                      {formatMoney(sumValue(roomItems))}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-16">
      <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-ink/50">Loading…</p>
    </div>
  );
}
