import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatClock } from "./format";

/** "Live · last updated 09:42:13", or a stale-data warning when the latest request failed. */
export function LastUpdated({
  lastUpdated,
  hasError,
  onRetry,
  live = true,
}: {
  lastUpdated: Date | null;
  hasError: boolean;
  onRetry: () => void;
  live?: boolean;
}) {
  if (hasError && lastUpdated) {
    return (
      <span className="flex flex-wrap items-center gap-2 text-amber-800 dark:text-amber-300">
        <TriangleAlert className="size-4" aria-hidden="true" />
        Connection lost — showing data from <time dateTime={lastUpdated.toISOString()}>{formatClock(lastUpdated, true)}</time>
        <Button variant="outline" size="xs" onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
          Retry
        </Button>
      </span>
    );
  }
  if (!lastUpdated) return null;
  return (
    <span className="flex items-center gap-2">
      {live && (
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-green-600" />
        </span>
      )}
      <span>
        {live ? "Live · last updated" : "Updated"}{" "}
        <time dateTime={lastUpdated.toISOString()}>{formatClock(lastUpdated, true)}</time>
      </span>
    </span>
  );
}

/** Page heading, one-line subheading and the data freshness indicator. */
export function PageHeader({
  title,
  subtitle,
  lastUpdated,
  hasError,
  onRetry,
  live,
}: {
  title: string;
  subtitle: React.ReactNode;
  lastUpdated: Date | null;
  hasError: boolean;
  onRetry: () => void;
  live?: boolean;
}) {
  return (
    <header className="space-y-1">
      <h1 className="font-heading font-semibold text-2xl tracking-tight">{title}</h1>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm">
        <span>{subtitle}</span>
        {(lastUpdated || hasError) && <span aria-hidden="true">·</span>}
        <LastUpdated lastUpdated={lastUpdated} hasError={hasError} onRetry={onRetry} live={live} />
      </div>
    </header>
  );
}
