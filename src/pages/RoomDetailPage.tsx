import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import { Button } from "../components/Button";
import { SummaryCard } from "../components/SummaryCard";
import { EmptyState } from "../components/EmptyState";
import { NameDialog } from "../components/NameDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PageLoading } from "./DashboardPage";
import { NotFound } from "./NotFound";
import { formatMoney, countLabel } from "../lib/formatters";
import { sumValue } from "../lib/stats";
import { roomColor } from "../lib/theme";
import type { Category } from "../types/inventory";

const rowAction =
  "rounded-md border-2 border-ink px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.06em] hover:bg-ink hover:text-bone";

export function RoomDetailPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { rooms, categories, items, loading, addCategory, updateCategory, deleteCategory, deleteRoom } =
    useInventory();

  const [showAddCat, setShowAddCat] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);
  const [confirmDeleteRoom, setConfirmDeleteRoom] = useState(false);

  if (loading) return <PageLoading />;

  const room = rooms.find((r) => r.id === roomId);
  if (!room) return <NotFound label="Room not found" to="/rooms" />;

  const color = roomColor(room.id);
  const roomCats = categories.filter((c) => c.room_id === room.id);
  const roomItems = items.filter((i) => i.room_id === room.id);

  return (
    <section className="min-h-[80vh]" style={{ background: color }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-8">
        <Link
          to="/rooms"
          className="text-[11px] font-extrabold uppercase tracking-[0.12em] underline underline-offset-2"
        >
          ← Rooms
        </Link>

        <h1 className="mt-4 break-words text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl">
          {room.name}
        </h1>
        <div className="hv-rule-thin mt-6" />

        <div className="mt-6 grid grid-cols-3 gap-3">
          <SummaryCard label="Categories" value={String(roomCats.length)} />
          <SummaryCard label="Items" value={String(roomItems.length)} />
          <SummaryCard label="Value" value={formatMoney(sumValue(roomItems))} />
        </div>

        <div className="mt-10 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black uppercase tracking-tight">Categories</h2>
          <Button onClick={() => setShowAddCat(true)}>Add Category</Button>
        </div>

        {roomCats.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No categories yet"
              message="Add a category like Electronics, Furniture, Tools, or Appliances."
              action={<Button onClick={() => setShowAddCat(true)}>Add Category</Button>}
            />
          </div>
        ) : (
          <div className="mt-6 border-t-2 border-ink">
            {roomCats.map((cat) => {
              const catItems = roomItems.filter((i) => i.category_id === cat.id);
              return (
                <div key={cat.id} className="border-b-2 border-ink transition-colors hover:bg-ink/10">
                  <div className="flex items-center gap-3 pr-1">
                    <Link
                      to={`/rooms/${room.id}/categories/${cat.id}`}
                      className="min-w-0 flex-1 py-5"
                    >
                      <span className="block truncate text-2xl font-black uppercase tracking-tight sm:text-3xl">
                        {cat.name}
                      </span>
                    </Link>
                    <div className="hidden text-right text-[11px] font-bold uppercase tracking-wider text-ink/70 sm:block">
                      <div>{countLabel(catItems.length, "item")}</div>
                      <div className="text-ink">{formatMoney(sumValue(catItems))}</div>
                    </div>
                    <div className="flex flex-none gap-2 pl-2">
                      <button className={rowAction} onClick={() => setEditingCat(cat)}>
                        Edit
                      </button>
                      <button className={rowAction} onClick={() => setDeletingCat(cat)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12">
          <Button variant="danger" onClick={() => setConfirmDeleteRoom(true)}>
            Delete Room
          </Button>
        </div>
      </div>

      {showAddCat && (
        <NameDialog
          title="Add Category"
          label="Category Name"
          confirmLabel="Add Category"
          onSubmit={async (name) => {
            await addCategory(room.id, name);
            setShowAddCat(false);
          }}
          onCancel={() => setShowAddCat(false)}
        />
      )}

      {editingCat && (
        <NameDialog
          title="Edit Category"
          label="Category Name"
          initialValue={editingCat.name}
          onSubmit={async (name) => {
            await updateCategory(editingCat.id, name);
            setEditingCat(null);
          }}
          onCancel={() => setEditingCat(null)}
        />
      )}

      {deletingCat && (
        <ConfirmDialog
          title="Delete Category?"
          message="This permanently deletes this category and all items and photos inside it."
          onConfirm={() => {
            void deleteCategory(deletingCat.id);
            setDeletingCat(null);
          }}
          onCancel={() => setDeletingCat(null)}
        />
      )}

      {confirmDeleteRoom && (
        <ConfirmDialog
          title="Delete Room?"
          message="This permanently deletes this room and everything inside it."
          onConfirm={() => {
            void deleteRoom(room.id);
            navigate("/rooms");
          }}
          onCancel={() => setConfirmDeleteRoom(false)}
        />
      )}
    </section>
  );
}
