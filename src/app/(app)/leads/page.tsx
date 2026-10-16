import { leads } from "@/lib/mock-data";

import { LeadsTable } from "./_components/leads-table";

export default async function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-medium tracking-tight">Leads</h1>
        <p className="text-muted-foreground text-sm">{leads.length.toLocaleString()} leads across all tenants.</p>
      </div>
      <LeadsTable data={leads} />
    </div>
  );
}
