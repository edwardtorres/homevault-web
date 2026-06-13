import { useInventory } from "../context/InventoryContext";
import { SummaryCard } from "../components/SummaryCard";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/Button";
import { PageLoading } from "./DashboardPage";
import { buildInventoryCsv, csvFileName, downloadCsv } from "../lib/csvExport";
import { dashboardStats } from "../lib/stats";
import { formatMoney } from "../lib/formatters";

const COLUMNS = [
  "Room",
  "Category",
  "Item Name",
  "Serial Number",
  "Estimated Value",
  "Notes",
  "Photo Path or URL",
  "Created Date",
  "Updated Date",
];

export function ExportPage() {
  const { rooms, categories, items, loading } = useInventory();

  if (loading) return <PageLoading />;

  const stats = dashboardStats(rooms, categories, items);

  const handleExport = () => {
    const csv = buildInventoryCsv(rooms, categories, items);
    downloadCsv(csvFileName(), csv);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8">
      <h1 className="text-5xl font-black uppercase tracking-tight sm:text-6xl">Export</h1>
      <p className="mt-3 text-sm font-bold text-ink/60">
        Download your inventory as a CSV spreadsheet for insurance records or backups.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <SummaryCard label="Items" value={String(stats.totalItems)} />
        <SummaryCard label="Total Value" value={formatMoney(stats.totalValue)} />
      </div>

      {stats.totalItems === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Nothing to export yet"
            message="Add rooms, categories, and items before exporting your inventory."
          />
        </div>
      ) : (
        <>
          <div className="mt-10 border-2 border-ink p-6">
            <h2 className="text-xl font-black uppercase tracking-tight">CSV Spreadsheet</h2>
            <p className="mt-2 text-sm font-semibold text-ink/70">
              Opens in Numbers, Excel, or Google Sheets. The image files themselves are not
              included — only a reference path or URL.
            </p>
            <div className="mt-5">
              <Button onClick={handleExport}>Export CSV</Button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-black uppercase tracking-tight">Columns</h2>
            <div className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {COLUMNS.map((col) => (
                <div
                  key={col}
                  className="flex items-center gap-2 border-b-2 border-ink/15 py-2 text-sm font-bold"
                >
                  <span className="h-2.5 w-2.5 flex-none bg-ink" />
                  {col}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
