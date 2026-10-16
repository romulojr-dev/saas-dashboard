"use client";

import { ArrowUpDown } from "lucide-react";
import type { Column, ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Lead } from "@/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

function SortableHeader<TData>({ column, label }: { column: Column<TData, unknown>; label: string }) {
  return (
    <Button
      variant="ghost"
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="size-3.5" />
    </Button>
  );
}

const statusBadgeProps: Record<Lead["status"], { variant?: "outline" | "secondary" | "destructive"; className?: string }> = {
  New: { variant: "outline" },
  Cold: { variant: "secondary" },
  Warm: { className: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  Negotiation: { className: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  "Closed Won": { className: "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300" },
  "Closed Lost": { variant: "destructive" },
};

export const leadColumns: ColumnDef<Lead>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "name",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => <SortableHeader column={column} label="Name" />,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">
          {row.original.firstName} {row.original.lastName}
        </span>
        <span className="text-muted-foreground text-xs">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => <SortableHeader column={column} label="Company" />,
  },
  {
    accessorKey: "jobTitle",
    header: ({ column }) => <SortableHeader column={column} label="Job Title" />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return <Badge {...statusBadgeProps[status]}>{status}</Badge>;
    },
    filterFn: (row, columnId, filterValue) => row.getValue(columnId) === filterValue,
  },
  {
    accessorKey: "estimatedValue",
    header: ({ column }) => (
      <div className="text-right">
        <SortableHeader column={column} label="Est. Value" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{currencyFormatter.format(row.original.estimatedValue)}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} label="Created" />,
    cell: ({ row }) => dateFormatter.format(new Date(row.original.createdAt)),
  },
  {
    accessorKey: "lastContactedAt",
    header: ({ column }) => <SortableHeader column={column} label="Last Contacted" />,
    cell: ({ row }) => dateFormatter.format(new Date(row.original.lastContactedAt)),
  },
];
