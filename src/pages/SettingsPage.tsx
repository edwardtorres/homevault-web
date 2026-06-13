import { useState } from "react";
import { useSession } from "../context/SessionContext";
import { useInventory } from "../context/InventoryContext";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function SettingsPage() {
  const { mode, userEmail, signOut, exitDemo } = useSession();
  const { rooms, clearAll } = useInventory();
  const isDemo = mode === "demo";
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <h1 className="text-5xl font-black uppercase tracking-tight sm:text-6xl">Settings</h1>

      <section className="mt-8 border-2 border-ink p-6">
        <h2 className="text-xl font-black uppercase tracking-tight">Account</h2>
        <dl className="mt-4 space-y-3 text-sm font-bold">
          <Row label="App" value="HomeVault" />
          <Row label="Status" value={isDemo ? "Demo Mode" : "Signed in"} />
          {!isDemo && userEmail && <Row label="Email" value={userEmail} />}
        </dl>
        <div className="mt-6">
          <Button variant="ghost" onClick={isDemo ? exitDemo : signOut}>
            {isDemo ? "Exit Demo" : "Sign Out"}
          </Button>
        </div>
      </section>

      <section className="mt-6 border-2 border-ink p-6">
        <h2 className="text-xl font-black uppercase tracking-tight">Privacy</h2>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-ink/70">
          HomeVault stores your inventory in your Supabase project account, protected so each user
          can only access their own data and photos. This portfolio version includes one optional
          item photo, but does not include advertising, payment processing, or App Store–specific
          features.
        </p>
      </section>

      {rooms.length > 0 && (
        <section className="mt-6 border-2 border-clay p-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-clay">Danger Zone</h2>
          <p className="mt-3 text-sm font-semibold text-ink/70">
            Remove all rooms, categories, items, and photos. This cannot be undone.
          </p>
          <div className="mt-5">
            <Button variant="danger" onClick={() => setConfirmClear(true)}>
              Delete All Data
            </Button>
          </div>
        </section>
      )}

      {confirmClear && (
        <ConfirmDialog
          title="Delete all data?"
          message="This permanently removes every room, category, item, and photo from your inventory."
          confirmLabel="Delete Everything"
          onConfirm={() => {
            void clearAll();
            setConfirmClear(false);
          }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b-2 border-ink/15 pb-2">
      <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink/60">{label}</dt>
      <dd className="max-w-[60%] truncate text-right">{value}</dd>
    </div>
  );
}
