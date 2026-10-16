"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { BatteryFull, BatteryLow, BatteryMedium, BatteryWarning, HardHat, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { DataTable, SortableHeader } from "@/components/safety/data-table";
import { formatClock, formatRelative } from "@/components/safety/format";
import { SafetyCard } from "@/components/safety/safety-card";
import { CameraStatusBadge, DeviceStatusBadge } from "@/components/safety/status-badge";
import { cn } from "@/lib/utils";
import type { Device, DevicesData, SafetyFilters } from "@/types";

interface DeviceRow extends Device {
  minutesSinceSeen: number;
  issues: string[];
}

type Thresholds = DevicesData["thresholds"];

function toRows(data: DevicesData): DeviceRow[] {
  const { lowBatteryPct, staleAfterMin } = data.thresholds;
  const now = new Date(data.generatedAt).getTime();
  return data.devices.map((device) => {
    const minutesSinceSeen = Math.max(0, Math.round((now - new Date(device.lastSeen).getTime()) / 60000));
    const issues = [
      device.status === "Offline" && "Offline",
      device.battery < lowBatteryPct && "Low battery",
      minutesSinceSeen > staleAfterMin && `Not seen for ${minutesSinceSeen} min`,
    ].filter((issue): issue is string => Boolean(issue));
    return { ...device, minutesSinceSeen, issues };
  });
}

function gpsLabel(signal: number | null) {
  if (signal === null) return "No fix";
  if (signal >= 75) return "Strong";
  if (signal >= 40) return "Fair";
  return "Weak";
}

function BatteryCell({ battery, low }: { battery: number; low: boolean }) {
  const Icon = low ? BatteryWarning : battery < 50 ? BatteryLow : battery < 80 ? BatteryMedium : BatteryFull;
  return (
    <span className={cn("inline-flex items-center gap-1.5 tabular-nums", low && "font-medium text-red-700 dark:text-red-400")}>
      <Icon className="size-4" aria-hidden="true" />
      {battery}%
      {low && <span className="sr-only"> (low)</span>}
    </span>
  );
}

function makeColumns({ lowBatteryPct, latestFirmware }: Thresholds, referenceTime: string): ColumnDef<DeviceRow>[] {
  return [
    {
      id: "issues",
      accessorFn: (row) => row.issues.length,
      header: ({ column }) => <SortableHeader column={column} label="Issues" />,
      cell: ({ row }) =>
        row.original.issues.length ? (
          <span className="inline-flex items-start gap-1.5 font-medium text-red-800 text-xs dark:text-red-300">
            <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{row.original.issues.join(" · ")}</span>
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">None</span>
        ),
    },
    {
      accessorKey: "id",
      header: ({ column }) => <SortableHeader column={column} label="Device ID" />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
    },
    {
      accessorKey: "workerId",
      header: ({ column }) => <SortableHeader column={column} label="Worker ID" />,
      cell: ({ row }) => <span className="font-medium">{row.original.workerId}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <SortableHeader column={column} label="Status" />,
      cell: ({ row }) => <DeviceStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "battery",
      header: ({ column }) => <SortableHeader column={column} label="Battery" />,
      cell: ({ row }) => <BatteryCell battery={row.original.battery} low={row.original.battery < lowBatteryPct} />,
    },
    {
      id: "gpsSignal",
      accessorFn: (row) => row.gpsSignal ?? -1,
      header: ({ column }) => <SortableHeader column={column} label="GPS signal" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {gpsLabel(row.original.gpsSignal)}
          {row.original.gpsSignal !== null && (
            <span className="text-muted-foreground tabular-nums"> · {row.original.gpsSignal}%</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "cameraStatus",
      header: ({ column }) => <SortableHeader column={column} label="Camera" />,
      cell: ({ row }) => <CameraStatusBadge status={row.original.cameraStatus} />,
    },
    {
      id: "lastSeen",
      accessorFn: (row) => row.minutesSinceSeen,
      header: ({ column }) => <SortableHeader column={column} label="Last seen" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          <time dateTime={row.original.lastSeen} className="tabular-nums">
            {formatClock(row.original.lastSeen)}
          </time>
          <span className="text-muted-foreground"> · {formatRelative(row.original.lastSeen, referenceTime)}</span>
        </span>
      ),
    },
    {
      accessorKey: "firmware",
      header: ({ column }) => <SortableHeader column={column} label="Firmware" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-mono text-xs">
          {row.original.firmware}
          {row.original.firmware !== latestFirmware && (
            <span className="ml-1.5 font-sans text-amber-800 dark:text-amber-300">update available</span>
          )}
        </span>
      ),
    },
  ];
}

const statusItems = [
  { value: "all", label: "All devices" },
  { value: "attention", label: "Needs attention" },
  { value: "Online", label: "Online" },
  { value: "Offline", label: "Offline" },
];

function DeviceTable({ data }: { data: DevicesData }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "issues", desc: true }]);
  const [statusFilter, setStatusFilter] = useState("all");

  const rows = toRows(data).filter((row) =>
    statusFilter === "all" ? true : statusFilter === "attention" ? row.issues.length > 0 : row.status === statusFilter,
  );

  const table = useReactTable({
    data: rows,
    columns: makeColumns(data.thresholds, data.generatedAt),
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const attention = toRows(data).filter((row) => row.issues.length > 0).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select value={statusFilter} items={statusItems} onValueChange={(value) => setStatusFilter(value ?? "all")}>
          <SelectTrigger aria-label="Filter devices by status" className="w-48">
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
        <p className="text-muted-foreground text-xs">
          {attention} of {data.devices.length} devices need attention (offline, below {data.thresholds.lowBatteryPct}% battery, or
          not seen for over {data.thresholds.staleAfterMin} min)
        </p>
      </div>
      <DataTable
        table={table}
        caption="Hard-hat device list"
        emptyText="No devices match this status."
        rowClassName={(row) =>
          row.original.issues.length ? "bg-red-50 hover:bg-red-100/70 dark:bg-red-950/40 dark:hover:bg-red-950/60" : undefined
        }
      />
    </div>
  );
}

export function DeviceList({
  data,
  status,
}: {
  data: DevicesData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
}) {
  return (
    <SafetyCard
      title="Device List"
      description="Every hard-hat sensor unit · live"
      data={data}
      status={status}
      isEmpty={(d) => d.devices.length === 0}
      empty={{ icon: HardHat, title: "No devices", description: "No helmets match the current filters." }}
      loading={<Skeleton className="h-96 w-full" />}
    >
      {(d) => <DeviceTable data={d} />}
    </SafetyCard>
  );
}
