import type { LucideIcon } from "lucide-react";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Shared status props for every card on the Site Safety Overview page. */
export interface CardStatusProps {
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function CardLoading({ label, className, children }: { label: string; className?: string; children?: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex h-full flex-col gap-3", className)}>
      <span className="sr-only">Loading {label}…</span>
      {children ?? (
        <>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="min-h-16 flex-1" />
        </>
      )}
    </div>
  );
}

export function CardError({
  error,
  onRetry,
  compact = false,
  className,
}: {
  error: Error;
  onRetry: () => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex h-full flex-col items-center justify-center gap-2 text-center",
        compact && "items-start text-left",
        className,
      )}
    >
      <p className="flex items-center gap-1.5 font-medium text-destructive">
        <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
        Couldn&apos;t load data
      </p>
      {!compact && <p className="max-w-xs text-muted-foreground text-xs">{error.message}</p>}
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw aria-hidden="true" />
        Retry
      </Button>
    </div>
  );
}

export function CardEmpty({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full flex-col items-center justify-center gap-2 py-6 text-center", className)}>
      <Icon className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-xs text-muted-foreground text-xs">{description}</p>}
    </div>
  );
}
