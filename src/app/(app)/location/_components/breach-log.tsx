"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { DataTable, SortableHeader, TablePagination } from "@/components/safety/data-table";
import { formatDateTime, formatDuration } from "@/components/safety/format";
import { SafetyCard } from "@/components/safety/safety-card";
import { AlertStatusBadge } from "@/components/safety/status-badge";
import { describeRange } from "@/lib/safety-filters";
import type { LocationData, SafetyEvent, SafetyFilters } from "@/types";

const statusOrder = { Open: 0, Acknowledged: 1, Resolved: 2 } as const;

const columns: ColumnDef<SafetyEvent>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} label="Time" />,
    cell: ({ row }) => (
      <time dateTime={row.original.createdAt} className="whitespace-nowrap tabular-nums">
        {formatDateTime(row.original.createdAt)}
      </time>
    ),
  },
  {
    accessorKey: "workerId",
    header: ({ column }) => <SortableHeader column={column} label="Worker ID" />,
    cell: ({ row }) => <span className="font-medium">{row.original.workerId}</span>,
  },
  {
    accessorKey: "zone",
    header: ({ column }) => <SortableHeader column={column} label="Zone" />,
  },
  {
    accessorKey: "durationSec",
    header: ({ column }) => <SortableHeader column={column} label="Duration" />,
    cell: ({ row }) => <span className="tabular-nums">{formatDuration(row.original.durationSec ?? 0)}</span>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} label="Status" />,
    sortingFn: (a, b) => statusOrder[a.original.status] - statusOrder[b.original.status],
    cell: ({ row }) => <AlertStatusBadge status={row.original.status} />,
  },
];

function BreachTable({ rows }: { rows: SafetyEvent[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Live polling replaces the data every 10 s; keep the reader on their page.
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="flex flex-col gap-3">
      <DataTable table={table} caption="Restricted-zone breach log" />
      <TablePagination table={table} />
    </div>
  );
}

export function BreachLog({
  data,
  status,
  filters,
}: {
  data: LocationData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
}) {
  return (
    <SafetyCard
      title="Breach Log"
      description={`Restricted-zone entries · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.breachLog.length === 0}
      empty={{ icon: ShieldCheck, title: "No breaches logged", description: "No restricted-zone entries match the current filters." }}
      loading={<Skeleton className="h-72 w-full" />}
    >
      {(d) => <BreachTable rows={d.breachLog} />}
    </SafetyCard>
  );
}
