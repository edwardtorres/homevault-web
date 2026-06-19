import { Link } from "react-router-dom";
import type { Category, Item, Room } from "../types/inventory";
import { formatMoney } from "../lib/formatters";
import { ItemPhoto } from "./ItemPhoto";

interface Props {
  item: Item;
  room?: Room;
  category?: Category;
}

/** A compact, tappable item row used by the dashboard and search results. */
export function ItemResultRow({ item, room, category }: Props) {
  const to =
    room && category ? `/rooms/${room.id}/categories/${category.id}` : "#";

  const context = [room?.name, category?.name, item.serial_number]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      to={to}
      className="flex items-center gap-4 border-b-2 border-ink/15 py-3 transition-colors hover:bg-ink/5"
    >
      <ItemPhoto url={item.photo_url} alt={item.name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-extrabold uppercase tracking-tight">
          {item.name}
        </div>
        {context && (
          <div className="truncate text-[11px] font-bold uppercase tracking-wider text-ink/60">
            {context}
          </div>
        )}
      </div>
      <div className="flex-none whitespace-nowrap text-sm font-black">
        {formatMoney(item.estimated_value)}
      </div>
    </Link>
  );
}
