import { useState } from "react";
import { Link } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { NameDialog } from "../components/NameDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PageLoading } from "./DashboardPage";
import { formatMoney, countLabel } from "../lib/formatters";
import { sumValue } from "../lib/stats";
import { roomColor } from "../lib/theme";
import type { Room } from "../types/inventory";

const rowAction =
  "rounded-md border-2 border-ink px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.06em] hover:bg-ink hover:text-bone";

export function RoomsPage() {
  const { rooms, categories, items, loading, addRoom, updateRoom, deleteRoom } = useInventory();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState<Room | null>(null);

  if (loading) return <PageLoading />;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <h1 className="text-5xl font-black uppercase tracking-tight sm:text-6xl">Rooms</h1>
        <Button onClick={() => setShowAdd(true)}>Add Room</Button>
      </div>

      {rooms.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No rooms yet"
            message="Tap Add Room to create your first room and start your inventory."
            action={<Button onClick={() => setShowAdd(true)}>Add Room</Button>}
          />
        </div>
      ) : (
        <div className="mt-8 border-t-[3px] border-ink">
          {rooms.map((room) => {
            const color = roomColor(room.id);
            const roomItems = items.filter((i) => i.room_id === room.id);
            const roomCats = categories.filter((c) => c.room_id === room.id);
            return (
              <div key={room.id} className="group relative border-b-[3px] border-ink">
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: color }}
                />
                <div className="relative flex flex-col items-start gap-2 py-4 pr-1 sm:flex-row sm:items-center sm:gap-3 sm:py-0">
                  <Link
                    to={`/rooms/${room.id}`}
                    className="flex w-full min-w-0 items-center gap-3 sm:flex-1 sm:gap-4 sm:py-6"
                  >
                    <span
                      className="h-5 w-5 flex-none border-2 border-ink sm:h-6 sm:w-6"
                      style={{ background: color }}
                    />
                    <span className="truncate text-2xl font-black uppercase tracking-tight sm:text-5xl">
                      {room.name}
                    </span>
                  </Link>

                  <div className="hidden text-right text-[11px] font-bold uppercase tracking-wider text-ink/70 sm:block">
                    <div>
                      {countLabel(roomCats.length, "category")} · {countLabel(roomItems.length, "item")}
                    </div>
                    <div className="text-ink">{formatMoney(sumValue(roomItems))}</div>
                  </div>

                  <div className="flex flex-none gap-2 pl-8 sm:pl-2">
                    <button className={rowAction} onClick={() => setEditing(room)}>
                      Edit
                    </button>
                    <button className={rowAction} onClick={() => setDeleting(room)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <NameDialog
          title="Add Room"
          label="Room Name"
          confirmLabel="Add Room"
          onSubmit={async (name) => {
            await addRoom(name);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {editing && (
        <NameDialog
          title="Edit Room"
          label="Room Name"
          initialValue={editing.name}
          onSubmit={async (name) => {
            await updateRoom(editing.id, name);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete Room?"
          message="This permanently deletes this room and all categories, items, and photos inside it."
          onConfirm={() => {
            void deleteRoom(deleting.id);
            setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
