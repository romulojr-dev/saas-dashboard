"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { BellOff, Download, ExternalLink, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { DataTable, SortableHeader, TablePagination } from "@/components/safety/data-table";
import { formatDateTime } from "@/components/safety/format";
import { SafetyCard } from "@/components/safety/safety-card";
import { SeverityBadge } from "@/components/safety/severity-badge";
import { AlertStatusBadge } from "@/components/safety/status-badge";
import { downloadCsv, toCsv } from "@/lib/csv";
import { describeRange, toDateParam } from "@/lib/safety-filters";
import type { AlertSeverity, AlertsData, AlertStatus, SafetyEvent, SafetyFilters } from "@/types";

const severityRank: Record<AlertSeverity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const statusRank: Record<AlertStatus, number> = { Open: 0, Acknowledged: 1, Resolved: 2 };

const statusItems = [
  { value: "all", label: "All statuses" },
  { value: "Open", label: "Open" },
  { value: "Acknowledged", label: "Acknowledged" },
  { value: "Resolved", label: "Resolved" },
];

function makeColumns(onView: (id: string) => void): ColumnDef<SafetyEvent>[] {
  return [
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
      accessorKey: "id",
      header: ({ column }) => <SortableHeader column={column} label="Alert ID" />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
    },
    {
      accessorKey: "workerId",
      header: ({ column }) => <SortableHeader column={column} label="Worker ID" />,
      cell: ({ row }) => <span className="font-medium">{row.original.workerId}</span>,
    },
    {
      accessorKey: "zone",
      header: ({ column }) => <SortableHeader column={column} label="Zone" />,
      cell: ({ row }) => <span className="whitespace-nowrap">{row.original.zone}</span>,
    },
    {
      accessorKey: "type",
      header: ({ column }) => <SortableHeader column={column} label="Type" />,
      cell: ({ row }) => <span className="whitespace-nowrap">{row.original.type}</span>,
    },
    {
      accessorKey: "severity",
      header: ({ column }) => <SortableHeader column={column} label="Severity" />,
      sortingFn: (a, b) => severityRank[a.original.severity] - severityRank[b.original.severity],
      cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <SortableHeader column={column} label="Status" />,
      sortingFn: (a, b) => statusRank[a.original.status] - statusRank[b.original.status],
      filterFn: (row, _columnId, value) => value === undefined || row.original.status === value,
      cell: ({ row }) => <AlertStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "assignedTo",
      header: ({ column }) => <SortableHeader column={column} label="Assigned to" />,
      cell: ({ row }) => row.original.assignedTo ?? <span className="text-muted-foreground">Unassigned</span>,
    },
    {
      id: "snapshot",
      header: "Snapshot",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.snapshotUrl ? (
          <a
            href={row.original.snapshotUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 whitespace-nowrap text-primary underline-offset-2 hover:underline"
          >
            Snapshot
            <ExternalLink className="size-3" aria-hidden="true" />
            <span className="sr-only">for {row.original.id} (opens in a new tab)</span>
          </a>
        ) : (
          <span className="text-muted-foreground text-xs">GPS only</span>
        ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => onView(row.original.id)}>
          View<span className="sr-only"> alert {row.original.id}</span>
        </Button>
      ),
    },
  ];
}

function exportCsv(rows: SafetyEvent[]) {
  const responseMin = (event: SafetyEvent) =>
    event.acknowledgedAt
      ? Math.round((new Date(event.acknowledgedAt).getTime() - new Date(event.createdAt).getTime()) / 6000) / 10
      : "";
  const csv = toCsv(
    [
      "Time",
      "Alert ID",
      "Worker ID",
      "Crew ID",
      "Zone",
      "Category",
      "Type",
      "Severity",
      "Status",
      "Assigned to",
      "Acknowledged at",
      "Resolved at",
      "Response (min)",
      "Snapshot",
    ],
    rows.map((event) => [
      event.createdAt,
      event.id,
      event.workerId,
      event.crewId,
      event.zone,
      event.category,
      event.type,
      event.severity,
      event.status,
      event.assignedTo,
      event.acknowledgedAt,
      event.resolvedAt,
      responseMin(event),
      event.snapshotUrl,
    ]),
  );
  downloadCsv(`incident-log-${toDateParam(new Date())}.csv`, csv);
}

function IncidentTable({ rows, onView }: { rows: SafetyEvent[]; onView: (id: string) => void }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columns] = useState(() => makeColumns(onView));

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, value) => {
      const needle = String(value).trim().toLowerCase();
      const { id, workerId, zone, type, assignedTo, severity } = row.original;
      return [id, workerId, zone, type, assignedTo ?? "", severity].some((field) => field.toLowerCase().includes(needle));
    },
    // Live polling replaces the data every 10 s; keep the reader on their page.
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 10 } },
  });

  const statusFilter = (table.getColumn("status")?.getFilterValue() as string | undefined) ?? "all";
  const filteredRows = table.getSortedRowModel().rows.map((row) => row.original);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-72">
          <InputGroupAddon>
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search alerts"
            placeholder="Search ID, worker, zone, type…"
            value={globalFilter}
            onChange={(event) => {
              setGlobalFilter(event.target.value);
              table.setPageIndex(0);
            }}
          />
        </InputGroup>
        <Select
          value={statusFilter}
          items={statusItems}
          onValueChange={(value) => {
            table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value);
            table.setPageIndex(0);
          }}
        >
          <SelectTrigger aria-label="Filter by status" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {statusItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="sm:ml-auto"
          onClick={() => exportCsv(filteredRows)}
          disabled={filteredRows.length === 0}
        >
          <Download aria-hidden="true" />
          Export CSV ({filteredRows.length})
        </Button>
      </div>
      <DataTable table={table} caption="Incident and near-miss log" emptyText="No alerts match your search." />
      <TablePagination table={table} />
    </div>
  );
}

export function IncidentLog({
  data,
  status,
  filters,
  onView,
}: {
  data: AlertsData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
  onView: (id: string) => void;
}) {
  return (
    <SafetyCard
      title="Incident & Near-Miss Log"
      description={`All alerts raised · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.log.length === 0}
      empty={{ icon: BellOff, title: "No alerts logged", description: "No alerts match the current filters." }}
      loading={<Skeleton className="h-96 w-full" />}
    >
      {(d) => <IncidentTable rows={d.log} onView={onView} />}
    </SafetyCard>
  );
}
