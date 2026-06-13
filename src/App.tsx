import { Navigate, Route, Routes } from "react-router-dom";
import { SessionProvider, useSession } from "./context/SessionContext";
import { InventoryProvider } from "./context/InventoryContext";
import { AppLayout } from "./components/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RoomsPage } from "./pages/RoomsPage";
import { RoomDetailPage } from "./pages/RoomDetailPage";
import { CategoryDetailPage } from "./pages/CategoryDetailPage";
import { SearchPage } from "./pages/SearchPage";
import { ExportPage } from "./pages/ExportPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <SessionProvider>
      <AppRoutes />
    </SessionProvider>
  );
}

function AppRoutes() {
  const { mode } = useSession();

  if (mode === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-xs font-extrabold uppercase tracking-[0.2em] text-ink/50">
        Loading…
      </div>
    );
  }

  // Logged-out visitors only see the login / demo entry point.
  if (mode === "guest") {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated users and demo visitors get the full app.
  return (
    <InventoryProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
          <Route
            path="/rooms/:roomId/categories/:categoryId"
            element={<CategoryDetailPage />}
          />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </InventoryProvider>
  );
}
