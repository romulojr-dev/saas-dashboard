const clockFormatter = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
const clockSecondsFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
const relativeFormatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto", style: "short" });

export function formatClock(iso: string | Date, withSeconds = false) {
  return (withSeconds ? clockSecondsFormatter : clockFormatter).format(new Date(iso));
}

/** Relative time measured against `reference` (the payload time), keeping renders pure. */
export function formatRelative(iso: string, reference: string | Date) {
  const seconds = Math.round((new Date(iso).getTime() - new Date(reference).getTime()) / 1000);
  if (Math.abs(seconds) < 60) return seconds > -10 ? "just now" : relativeFormatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, "minute");
  return relativeFormatter.format(Math.round(minutes / 60), "hour");
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const shortDateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

/** e.g. "Oct 13, 09:42" */
export function formatDateTime(iso: string | Date) {
  return dateTimeFormatter.format(new Date(iso));
}

/** e.g. "Oct 13" */
export function formatShortDate(iso: string | Date) {
  return shortDateFormatter.format(new Date(iso));
}

/** e.g. "4m 05s", "1h 12m" */
export function formatDuration(seconds: number) {
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const minutes = Math.floor(s / 60);
  if (minutes < 60) return `${minutes}m ${String(s % 60).padStart(2, "0")}s`;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

const weekdayDateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

/** Axis label for a time bucket: "09:00", "Oct 13" or "Oct 13" (week start). */
export function formatBucketTick(iso: string, granularity: "hour" | "day" | "week") {
  return granularity === "hour" ? formatClock(iso) : formatShortDate(iso);
}

/** Tooltip / table label for a time bucket: "Oct 13, 09:00", "Mon, Oct 13" or "Week of Oct 13". */
export function formatBucketLabel(iso: string, granularity: "hour" | "day" | "week") {
  if (granularity === "hour") return formatDateTime(iso);
  if (granularity === "day") return weekdayDateFormatter.format(new Date(iso));
  return `Week of ${formatShortDate(iso)}`;
}
