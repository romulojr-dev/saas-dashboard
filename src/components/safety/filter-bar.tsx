"use client";

import { CalendarDays, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePolledData } from "@/hooks/use-polled-data";
import { useSafetyFilters } from "@/hooks/use-safety-filters";
import { describeRange, hasActiveFilters, parseLocalDate, rangeLabels, toDateParam } from "@/lib/safety-filters";
import { fetchFilterOptions } from "@/lib/services/site-safety";
import type { DateRangePreset, SafetyFilters, Shift } from "@/types";

const ALL = "all";

const rangeItems = (Object.keys(rangeLabels) as DateRangePreset[]).map((value) => ({ value, label: rangeLabels[value] }));
const shiftItems = [
  { value: ALL, label: "All shifts" },
  { value: "Day", label: "Day (06:00–18:00)" },
  { value: "Night", label: "Night (18:00–06:00)" },
];

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="font-medium text-muted-foreground text-xs" aria-hidden="true">
        {label}
      </span>
      {children}
    </div>
  );
}

function CustomRangePicker({
  filters,
  open,
  onOpenChange,
  onApply,
}: {
  filters: SafetyFilters;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (from: string, to: string) => void;
}) {
  const current: DateRange | undefined =
    filters.from && filters.to ? { from: parseLocalDate(filters.from), to: parseLocalDate(filters.to) } : undefined;
  const [draft, setDraft] = useState<DateRange | undefined>(current);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(current);
        onOpenChange(next);
      }}
    >
      <PopoverTrigger render={<Button variant="outline" className="justify-start font-normal" />}>
        <CalendarDays aria-hidden="true" />
        {filters.range === "custom" ? describeRange(filters) : "Pick dates"}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Calendar
          mode="range"
          selected={draft}
          onSelect={setDraft}
          defaultMonth={draft?.from}
          disabled={(date) => date > new Date()}
          numberOfMonths={1}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!draft?.from || !draft?.to}
            onClick={() => {
              if (draft?.from && draft.to) {
                onApply(toDateParam(draft.from), toDateParam(draft.to));
                onOpenChange(false);
              }
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Date range / Zone / Crew / Shift filters. Values live in the URL query string, so every
 * card that reads `useSafetyFilters()` updates and the filtered view can be shared.
 */
export function FilterBar() {
  const { filters, setFilters, resetFilters } = useSafetyFilters();
  const options = usePolledData(fetchFilterOptions, { intervalMs: null });
  const [pickerOpen, setPickerOpen] = useState(false);

  const zoneItems = [
    { value: ALL, label: "All zones" },
    ...(options.data?.zones.map((zone) => ({ value: zone.id, label: zone.name })) ?? []),
  ];
  const crewItems = [
    { value: ALL, label: "All crews" },
    ...(options.data?.crews.map((crew) => ({ value: crew.id, label: `${crew.name} — ${crew.subcontractor}` })) ?? []),
  ];
  const optionsUnavailable = options.data === null;

  return (
    <section aria-label="Filters" className="flex flex-wrap items-end gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
      <FilterField label="Date range">
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.range}
            items={rangeItems}
            onValueChange={(value) => {
              if (value === "custom") setPickerOpen(true);
              else if (value) setFilters({ range: value as DateRangePreset, from: null, to: null });
            }}
          >
            <SelectTrigger aria-label="Date range" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {rangeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {(filters.range === "custom" || pickerOpen) && (
            <CustomRangePicker
              filters={filters}
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              onApply={(from, to) => setFilters({ range: "custom", from, to })}
            />
          )}
        </div>
      </FilterField>

      <FilterField label="Zone">
        <Select
          value={filters.zone ?? ALL}
          items={zoneItems}
          disabled={optionsUnavailable}
          onValueChange={(value) => setFilters({ zone: value && value !== ALL ? value : null })}
        >
          <SelectTrigger aria-label="Zone" className="w-48">
            <SelectValue placeholder={options.error ? "Zones unavailable" : "Loading…"} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL}>All zones</SelectItem>
            </SelectGroup>
            {(["Work area", "Restricted"] as const).map((kind) => (
              <SelectGroup key={kind}>
                <SelectLabel>{kind === "Work area" ? "Work areas" : "Restricted zones"}</SelectLabel>
                {options.data?.zones
                  .filter((zone) => zone.kind === kind)
                  .map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Crew / subcontractor">
        <Select
          value={filters.crew ?? ALL}
          items={crewItems}
          disabled={optionsUnavailable}
          onValueChange={(value) => setFilters({ crew: value && value !== ALL ? value : null })}
        >
          <SelectTrigger aria-label="Crew or subcontractor" className="w-60 max-w-full">
            <SelectValue placeholder={options.error ? "Crews unavailable" : "Loading…"} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {crewItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Shift">
        <Select
          value={filters.shift ?? ALL}
          items={shiftItems}
          onValueChange={(value) => setFilters({ shift: value && value !== ALL ? (value as Shift) : null })}
        >
          <SelectTrigger aria-label="Shift" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {shiftItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FilterField>

      {hasActiveFilters(filters) && (
        <Button variant="ghost" onClick={resetFilters} className="ml-auto">
          <RotateCcw aria-hidden="true" />
          Reset filters
        </Button>
      )}

      {options.error && (
        <p role="alert" className="basis-full text-destructive text-xs">
          Couldn&apos;t load zone and crew options.{" "}
          <button type="button" className="underline underline-offset-2" onClick={options.refetch}>
            Retry
          </button>
        </p>
      )}
    </section>
  );
}
