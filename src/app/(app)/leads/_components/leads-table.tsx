"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import {
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Lead } from "@/types";

import { leadColumns } from "./columns";

const statusFilterItems = [
  { value: "all", label: "All statuses" },
  { value: "New", label: "New" },
  { value: "Cold", label: "Cold" },
  { value: "Warm", label: "Warm" },
  { value: "Negotiation", label: "Negotiation" },
  { value: "Closed Won", label: "Closed Won" },
  { value: "Closed Lost", label: "Closed Lost" },
] as const;

const pageSizeItems = [
  { value: "10", label: "10 rows" },
  { value: "25", label: "25 rows" },
  { value: "50", label: "50 rows" },
  { value: "100", label: "100 rows" },
] as const;

export function LeadsTable({ data }: { data: Lead[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    jobTitle: false,
    lastContactedAt: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns: leadColumns,
    state: { sorting, columnFilters, globalFilter, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const needle = String(filterValue).toLowerCase();
      const { firstName, lastName, email, companyName } = row.original;
      return [firstName, lastName, email, companyName].some((field) => field.toLowerCase().includes(needle));
    },
    initialState: { pagination: { pageSize: 10 } },
  });

  const statusFilterValue = (table.getColumn("status")?.getFilterValue() as string | undefined) ?? "all";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="w-64">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search name, email, company..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
            />
          </InputGroup>

          <Select
            value={statusFilterValue}
            items={statusFilterItems}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger size="sm" className="min-w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statusFilterItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm">
                Columns
                <ChevronDown />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  className="capitalize"
                >
                  {column.id === "name" ? "Name" : column.id === "companyName" ? "Company" : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={leadColumns.length} className="h-24 text-center text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </p>

        <div className="flex items-center gap-4">
          <Select
            value={String(table.getState().pagination.pageSize)}
            items={pageSizeItems}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger size="sm" className="min-w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {pageSizeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <p className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
