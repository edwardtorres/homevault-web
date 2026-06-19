import { NavLink } from "react-router-dom";

export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/rooms", label: "Rooms" },
  { to: "/search", label: "Search" },
  { to: "/export", label: "Export" },
  { to: "/settings", label: "Settings" },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t-[3px] border-ink bg-bone pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `px-1 py-3.5 text-center text-[10px] font-extrabold uppercase tracking-[0.04em] ${
                isActive ? "bg-ink text-bone" : "text-ink/70"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
