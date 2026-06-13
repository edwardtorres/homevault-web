import { Link, NavLink, Outlet } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { BottomNav, NAV_ITEMS } from "./BottomNav";
import { DemoModeBanner } from "./DemoModeBanner";

export function AppLayout() {
  const { mode, userEmail, signOut, exitDemo } = useSession();
  const isDemo = mode === "demo";

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 bg-bone">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="text-lg font-black uppercase tracking-[0.18em]">
            HomeVault
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `text-xs font-extrabold uppercase tracking-[0.12em] ${
                    isActive ? "underline underline-offset-4" : "text-ink/60 hover:text-ink"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!isDemo && userEmail && (
              <span className="hidden max-w-[140px] truncate text-[11px] font-bold uppercase tracking-wider text-ink/50 sm:inline">
                {userEmail}
              </span>
            )}
            <button
              onClick={isDemo ? exitDemo : signOut}
              className="text-[11px] font-extrabold uppercase tracking-[0.1em] underline underline-offset-2"
            >
              {isDemo ? "Exit Demo" : "Sign Out"}
            </button>
          </div>
        </div>
        <div className="hv-rule" />
      </header>

      {isDemo && <DemoModeBanner />}

      <main className="flex-1 pb-24 md:pb-12">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
