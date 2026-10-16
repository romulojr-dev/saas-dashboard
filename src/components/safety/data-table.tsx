"use client";

import { type Column, flexRender, type Row, type Table as TanstackTable } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/** Column header that toggles sorting; the arrow shows the current direction. */
export function SortableHeader<TData>({ column, label }: { column: Column<TData, unknown>; label: string }) {
  const sorted = column.getIsSorted();
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <Button variant="ghost" size="sm" className="-ml-2.5 h-8" onClick={() => column.toggleSorting(sorted === "asc")}>
      {label}
      <Icon className="size-3.5" aria-hidden="true" />
    </Button>
  );
}

/**
 * Renders a TanStack table. Wide tables scroll horizontally inside their card.
 * `rowClassName` lets pages highlight rows (pair it with a visible text cue, not colour alone).
 */
export function DataTable<TData>({
  table,
  caption,
  emptyText = "No results.",
  rowClassName,
}: {
  table: TanstackTable<TData>;
  caption: string;
  emptyText?: string;
  rowClassName?: (row: Row<TData>) => string | undefined;
}) {
  const rows = table.getRowModel().rows;
  return (
    <Table>
      <caption className="sr-only">{caption}</caption>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const sorted = header.column.getIsSorted();
              return (
                <TableHead
                  key={header.id}
                  aria-sort={
                    header.column.getCanSort()
                      ? sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.length ? (
          rows.map((row) => (
            <TableRow key={row.id} className={rowClassName?.(row)}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center text-muted-foreground">
              {emptyText}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export function TablePagination<TData>({ table, className }: { table: TanstackTable<TData>; className?: string }) {
  const { pageIndex } = table.getState().pagination;
  const total = table.getFilteredRowModel().rows.length;
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2 text-muted-foreground text-xs", className)}>
      <span>
        {total} {total === 1 ? "row" : "rows"} · Page {total === 0 ? 0 : pageIndex + 1} of {table.getPageCount()}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}
