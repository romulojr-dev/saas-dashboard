"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import type { Campaign } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const statusBadgeProps: Record<Campaign["status"], { variant?: "secondary" | "outline"; className?: string }> = {
  Draft: { variant: "secondary" },
  Scheduled: { variant: "outline", className: "border-amber-500/40 text-amber-700 dark:text-amber-300" },
  Sent: { className: "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300" },
};

export const campaignColumns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "campaignName",
    header: "Campaign Name",
    cell: ({ row }) => <span className="font-medium">{row.original.campaignName}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return <Badge {...statusBadgeProps[status]}>{status}</Badge>;
    },
  },
  {
    accessorKey: "sentDate",
    header: "Sent Date",
    cell: ({ row }) => (row.original.sentDate ? dateFormatter.format(new Date(row.original.sentDate)) : "-"),
  },
  {
    id: "openRate",
    header: "Open Rate",
    cell: ({ row }) => {
      const { emailsSent, emailsOpened } = row.original;
      if (emailsSent === 0) return <span className="text-muted-foreground">-</span>;
      const rate = emailsOpened / emailsSent;
      return (
        <div className="flex items-center gap-2">
          <span className="tabular-nums">{Math.round(rate * 100)}%</span>
          <Progress value={rate * 100} className="w-16" />
        </div>
      );
    },
  },
  {
    id: "clickRate",
    header: "Click Rate",
    cell: ({ row }) => {
      const { emailsSent, clicks } = row.original;
      if (emailsSent === 0) return <span className="text-muted-foreground">-</span>;
      const rate = clicks / emailsSent;
      return <span className="tabular-nums">{Math.round(rate * 100)}%</span>;
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit Draft</DropdownMenuItem>
          <DropdownMenuItem>View Report</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
