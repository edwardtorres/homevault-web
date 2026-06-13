import type { Category, Item, Room } from "../types/inventory";

// Realistic sample inventory used by Demo Mode. Ids are stable strings so each
// room maps to a consistent section color. Nothing here touches Supabase.

export interface DemoSnapshot {
  rooms: Room[];
  categories: Category[];
  items: Item[];
}

const now = "2026-01-15T12:00:00.000Z";

function room(id: string, name: string): Room {
  return { id, user_id: null, name, created_at: now, updated_at: now };
}

function category(id: string, room_id: string, name: string): Category {
  return { id, user_id: null, room_id, name, created_at: now, updated_at: now };
}

function item(
  id: string,
  room_id: string,
  category_id: string,
  name: string,
  serial_number: string,
  estimated_value: number,
  notes: string,
  withPhoto = false
): Item {
  return {
    id,
    user_id: null,
    room_id,
    category_id,
    name,
    serial_number,
    estimated_value,
    notes,
    photo_path: null,
    photo_url: withPhoto ? `https://picsum.photos/seed/${id}/600/600` : null,
    created_at: now,
    updated_at: now,
  };
}

/** A fresh, deep-cloned snapshot so demo edits never mutate the seed. */
export function buildDemoData(): DemoSnapshot {
  const rooms: Room[] = [
    room("demo-room-kitchen", "Kitchen"),
    room("demo-room-living", "Living Room"),
    room("demo-room-garage", "Garage"),
    room("demo-room-office", "Home Office"),
  ];

  const categories: Category[] = [
    category("demo-cat-kitchen-appliances", "demo-room-kitchen", "Appliances"),
    category("demo-cat-kitchen-cookware", "demo-room-kitchen", "Cookware"),
    category("demo-cat-living-electronics", "demo-room-living", "Electronics"),
    category("demo-cat-living-furniture", "demo-room-living", "Furniture"),
    category("demo-cat-garage-tools", "demo-room-garage", "Tools"),
    category("demo-cat-garage-sports", "demo-room-garage", "Sports Equipment"),
    category("demo-cat-office-electronics", "demo-room-office", "Electronics"),
    category("demo-cat-office-furniture", "demo-room-office", "Furniture"),
  ];

  const items: Item[] = [
    item("demo-item-espresso", "demo-room-kitchen", "demo-cat-kitchen-appliances", "Espresso Machine", "BR-8842-A", 1200, "Bought 2024, receipt in the kitchen drawer.", true),
    item("demo-item-fridge", "demo-room-kitchen", "demo-cat-kitchen-appliances", "Refrigerator", "LG-4471-X", 2400, "French-door, stainless steel."),
    item("demo-item-mixer", "demo-room-kitchen", "demo-cat-kitchen-cookware", "Stand Mixer", "KA-093", 480, "Includes dough hook and whisk attachments.", true),
    item("demo-item-pan-set", "demo-room-kitchen", "demo-cat-kitchen-cookware", "Cookware Set", "", 320, "10-piece nonstick set."),

    item("demo-item-tv", "demo-room-living", "demo-cat-living-electronics", "65\" OLED TV", "SNY-6655", 1800, "Wall-mounted above the fireplace.", true),
    item("demo-item-soundbar", "demo-room-living", "demo-cat-living-electronics", "Soundbar", "SB-220", 350, "Dolby Atmos, paired with the TV."),
    item("demo-item-sofa", "demo-room-living", "demo-cat-living-furniture", "Sectional Sofa", "", 2200, "Gray fabric, seats five."),
    item("demo-item-coffee-table", "demo-room-living", "demo-cat-living-furniture", "Coffee Table", "", 450, "Solid oak."),

    item("demo-item-drill", "demo-room-garage", "demo-cat-garage-tools", "Cordless Drill", "DW-2031", 180, "Two batteries and a charger.", true),
    item("demo-item-toolchest", "demo-room-garage", "demo-cat-garage-tools", "Rolling Tool Chest", "TC-5590", 640, "5-drawer, locking."),
    item("demo-item-bike", "demo-room-garage", "demo-cat-garage-sports", "Mountain Bike", "TRK-9921", 1500, "29\" wheels, serviced last spring."),

    item("demo-item-laptop", "demo-room-office", "demo-cat-office-electronics", "Laptop", "MBP-7782", 2600, "16-inch, work + personal.", true),
    item("demo-item-monitor", "demo-room-office", "demo-cat-office-electronics", "Monitor", "DEL-3390", 520, "4K, 27-inch."),
    item("demo-item-desk", "demo-room-office", "demo-cat-office-furniture", "Standing Desk", "", 700, "Electric height adjustment."),
    item("demo-item-chair", "demo-room-office", "demo-cat-office-furniture", "Office Chair", "HM-1100", 950, "Ergonomic, lumbar support."),
  ];

  return { rooms, categories, items };
}
