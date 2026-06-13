// Section colors for the "color per section" Aretè look. Each room is assigned
// a stable color derived from its id, so the whole screen floods to that color
// when you open the room (and its categories / items / forms inherit it).

export const INK = "#15140E";
export const BONE = "#E7E0D2";

export const SECTION_COLORS: string[] = [
  "#B0562F", // terracotta
  "#93A1A8", // slate
  "#74764E", // olive
  "#C58A2C", // ochre
  "#9B5A45", // clay
  "#4E6E6A", // muted teal
];

/** Deterministic hash so a given room id always maps to the same color. */
function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** The flood/background color for a room (and everything inside it). */
export function roomColor(roomId: string): string {
  return SECTION_COLORS[hashString(roomId) % SECTION_COLORS.length];
}
