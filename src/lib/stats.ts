import type { Category, DashboardStats, Item, Room } from "../types/inventory";

export function sumValue(items: Item[]): number {
  return items.reduce((total, i) => total + (Number(i.estimated_value) || 0), 0);
}

export function dashboardStats(
  rooms: Room[],
  categories: Category[],
  items: Item[]
): DashboardStats {
  return {
    totalRooms: rooms.length,
    totalCategories: categories.length,
    totalItems: items.length,
    totalValue: sumValue(items),
  };
}
