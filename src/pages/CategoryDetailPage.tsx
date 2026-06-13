import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import { Button } from "../components/Button";
import { SummaryCard } from "../components/SummaryCard";
import { EmptyState } from "../components/EmptyState";
import { ItemPhoto } from "../components/ItemPhoto";
import { ItemFormModal } from "../components/ItemFormModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Modal } from "../components/Modal";
import { PageLoading } from "./DashboardPage";
import { NotFound } from "./NotFound";
import { formatMoney, formatMoneyPrecise, formatDate } from "../lib/formatters";
import { sumValue } from "../lib/stats";
import { roomColor } from "../lib/theme";
import type { Item, ItemInput, PhotoChange } from "../types/inventory";

export function CategoryDetailPage() {
  const { roomId, categoryId } = useParams();
  const navigate = useNavigate();
  const { rooms, categories, items, loading, addItem, updateItem, deleteItem, deleteCategory } =
    useInventory();

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [viewing, setViewing] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(false);

  if (loading) return <PageLoading />;

  const room = rooms.find((r) => r.id === roomId);
  const category = categories.find((c) => c.id === categoryId);
  if (!room || !category) return <NotFound label="Category not found" to="/rooms" />;

  const color = roomColor(room.id);
  const catItems = items.filter((i) => i.category_id === category.id);

  // Resolve the freshest copy of the item being viewed (so edits reflect live).
  const viewingItem = viewing ? items.find((i) => i.id === viewing.id) ?? null : null;

  const buildPhotoChange = (photo: { file: File | null; remove: boolean }): PhotoChange =>
    photo.file ? { type: "replace", file: photo.file } : photo.remove ? { type: "remove" } : { type: "keep" };

  return (
    <section className="min-h-[80vh]" style={{ background: color }}>
      <div className="mx-auto w-full max-w-5xl px-5 py-8">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em]">
          <Link to="/rooms" className="underline underline-offset-2">
            Rooms
          </Link>
          <span>/</span>
          <Link to={`/rooms/${room.id}`} className="underline underline-offset-2">
            {room.name}
          </Link>
        </div>

        <h1 className="mt-4 break-words text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl">
          {category.name}
        </h1>
        <div className="hv-rule-thin mt-6" />

        <div className="mt-6 grid grid-cols-2 gap-3">
          <SummaryCard label="Items" value={String(catItems.length)} />
          <SummaryCard label="Value" value={formatMoney(sumValue(catItems))} />
        </div>

        <div className="mt-10 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black uppercase tracking-tight">Items</h2>
          <Button onClick={() => setShowAdd(true)}>Add Item</Button>
        </div>

        {catItems.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No items yet"
              message="Add your first item in this category."
              action={<Button onClick={() => setShowAdd(true)}>Add Item</Button>}
            />
          </div>
        ) : (
          <div className="mt-6 border-t-2 border-ink">
            {catItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setViewing(item)}
                className="flex w-full items-center gap-4 border-b-2 border-ink py-4 text-left transition-colors hover:bg-ink/10"
              >
                <ItemPhoto url={item.photo_url} alt={item.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xl font-black uppercase tracking-tight">
                    {item.name}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ink/70">
                    {item.serial_number ? `Serial ${item.serial_number}` : "No serial number"}
                  </div>
                </div>
                <div className="text-base font-black">{formatMoney(item.estimated_value)}</div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-12">
          <Button variant="danger" onClick={() => setConfirmDeleteCategory(true)}>
            Delete Category
          </Button>
        </div>
      </div>

      {/* Add item */}
      {showAdd && (
        <ItemFormModal
          title="Add Item"
          roomName={room.name}
          categoryName={category.name}
          color={color}
          onClose={() => setShowAdd(false)}
          onSave={async (input: ItemInput, photo) => {
            await addItem(room.id, category.id, input, photo.file);
          }}
        />
      )}

      {/* Edit item */}
      {editing && (
        <ItemFormModal
          title="Edit Item"
          roomName={room.name}
          categoryName={category.name}
          color={color}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (input: ItemInput, photo) => {
            await updateItem(editing.id, input, buildPhotoChange(photo));
          }}
        />
      )}

      {/* Item detail */}
      {viewingItem && (
        <Modal title="Item" onClose={() => setViewing(null)} color={color}>
          <div className="space-y-5">
            {viewingItem.photo_url && (
              <img
                src={viewingItem.photo_url}
                alt={viewingItem.name}
                className="max-h-64 w-full border-2 border-ink object-cover"
              />
            )}
            <h3 className="text-3xl font-black uppercase tracking-tight">{viewingItem.name}</h3>
            <dl className="space-y-2 text-sm font-bold">
              <DetailRow label="Room" value={room.name} />
              <DetailRow label="Category" value={category.name} />
              <DetailRow
                label="Serial"
                value={viewingItem.serial_number || "—"}
              />
              <DetailRow
                label="Estimated Value"
                value={formatMoneyPrecise(viewingItem.estimated_value)}
              />
              <DetailRow label="Added" value={formatDate(viewingItem.created_at)} />
              {viewingItem.notes && <DetailRow label="Notes" value={viewingItem.notes} />}
            </dl>
            <div className="flex gap-3 pt-1">
              <Button
                onClick={() => {
                  setEditing(viewingItem);
                  setViewing(null);
                }}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setDeleting(viewingItem);
                  setViewing(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete item */}
      {deleting && (
        <ConfirmDialog
          title="Delete Item?"
          message="This permanently deletes this item and its photo."
          onConfirm={() => {
            void deleteItem(deleting.id);
            setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}

      {/* Delete category */}
      {confirmDeleteCategory && (
        <ConfirmDialog
          title="Delete Category?"
          message="This permanently deletes this category and all items and photos inside it."
          onConfirm={() => {
            void deleteCategory(category.id);
            navigate(`/rooms/${room.id}`);
          }}
          onCancel={() => setConfirmDeleteCategory(false)}
        />
      )}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b-2 border-ink/15 pb-2">
      <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink/60">{label}</dt>
      <dd className="max-w-[60%] text-right">{value}</dd>
    </div>
  );
}
