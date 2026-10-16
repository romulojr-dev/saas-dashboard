import type { DateRangePreset, SafetyFilters, Shift } from "@/types";

export const DEFAULT_FILTERS: SafetyFilters = {
  range: "7d",
  from: null,
  to: null,
  zone: null,
  crew: null,
  shift: null,
};

const RANGES: DateRangePreset[] = ["today", "7d", "30d", "custom"];
const SHIFTS: Shift[] = ["Day", "Night"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const rangeLabels: Record<DateRangePreset, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  custom: "Custom",
};

/** Reads filters from a URL query string, ignoring anything malformed. */
export function parseFilters(params: URLSearchParams): SafetyFilters {
  const range = params.get("range");
  const from = params.get("from");
  const to = params.get("to");
  const shift = params.get("shift");

  const filters: SafetyFilters = {
    range: RANGES.includes(range as DateRangePreset) ? (range as DateRangePreset) : DEFAULT_FILTERS.range,
    from: from && DATE_PATTERN.test(from) ? from : null,
    to: to && DATE_PATTERN.test(to) ? to : null,
    zone: params.get("zone") || null,
    crew: params.get("crew") || null,
    shift: SHIFTS.find((s) => s.toLowerCase() === shift?.toLowerCase()) ?? null,
  };

  // A custom range without dates falls back to the default preset.
  if (filters.range === "custom" && !(filters.from && filters.to)) {
    return { ...filters, range: DEFAULT_FILTERS.range, from: null, to: null };
  }
  if (filters.range !== "custom") {
    return { ...filters, from: null, to: null };
  }
  return filters;
}

/** Writes filters to a query string, omitting defaults so shared URLs stay short. */
export function serializeFilters(filters: SafetyFilters): string {
  const params = new URLSearchParams();
  if (filters.range !== DEFAULT_FILTERS.range) params.set("range", filters.range);
  if (filters.range === "custom" && filters.from && filters.to) {
    params.set("from", filters.from);
    params.set("to", filters.to);
  }
  if (filters.zone) params.set("zone", filters.zone);
  if (filters.crew) params.set("crew", filters.crew);
  if (filters.shift) params.set("shift", filters.shift.toLowerCase());
  return params.toString();
}

export function hasActiveFilters(filters: SafetyFilters) {
  return serializeFilters(filters) !== "";
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toDateParam(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Resolves the date filter to a [start, end) window in epoch ms. */
export function resolveDateRange(filters: SafetyFilters, now: number): { start: number; end: number } {
  const today = startOfDay(new Date(now));
  const daysBack = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d.getTime();
  };

  switch (filters.range) {
    case "today":
      return { start: today.getTime(), end: now };
    case "30d":
      return { start: daysBack(29), end: now };
    case "custom": {
      if (filters.from && filters.to) {
        const start = parseLocalDate(filters.from);
        const end = parseLocalDate(filters.to);
        end.setDate(end.getDate() + 1); // inclusive end date
        return { start: start.getTime(), end: Math.min(end.getTime(), now) };
      }
      return { start: daysBack(6), end: now };
    }
    default:
      return { start: daysBack(6), end: now };
  }
}

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

/** Human label for the active period, e.g. "Last 7 days" or "Oct 1 – Oct 9". */
export function describeRange(filters: SafetyFilters) {
  if (filters.range === "custom" && filters.from && filters.to) {
    return `${shortDate.format(parseLocalDate(filters.from))} – ${shortDate.format(parseLocalDate(filters.to))}`;
  }
  return rangeLabels[filters.range];
}
