import { ArrowDown, ArrowUp, type LucideIcon, Minus } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CardError, CardLoading, type CardStatusProps } from "./card-states";

/** A stat tile: title + icon, then a big value rendered from `data` once it has loaded. */
export function KpiCard<T>({
  title,
  icon: Icon,
  data,
  status,
  children,
  className,
}: {
  title: string;
  icon: LucideIcon;
  data: T | null;
  status: CardStatusProps;
  children: (data: T) => React.ReactNode;
  className?: string;
}) {
  let body: React.ReactNode;
  if (data !== null) {
    body = children(data);
  } else if (status.error) {
    body = <CardError error={status.error} onRetry={status.onRetry} compact />;
  } else {
    body = (
      <CardLoading label={title}>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-28" />
      </CardLoading>
    );
  }

  return (
    <Card className={cn("gap-3", className)}>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground">{title}</CardTitle>
        <CardAction>
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end gap-1">{body}</CardContent>
    </Card>
  );
}

export function KpiValue({ value, unit, className }: { value: React.ReactNode; unit?: string; className?: string }) {
  return (
    <p className={cn("font-heading text-4xl leading-none tracking-tight tabular-nums", className)}>
      {value}
      {unit && <span className="ml-1 font-normal text-base text-muted-foreground">{unit}</span>}
    </p>
  );
}

export function KpiNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-muted-foreground text-xs", className)}>{children}</p>;
}

/**
 * Up/down change vs. a previous value. `goodDirection` says which way is an improvement,
 * which picks the colour; the arrow and wording carry the meaning without colour.
 */
export function ChangeIndicator({
  current,
  previous,
  goodDirection = "down",
  label = "vs previous period",
  format = (value) => String(value),
}: {
  current: number;
  previous: number;
  goodDirection?: "up" | "down";
  label?: string;
  format?: (value: number) => string;
}) {
  const diff = Math.round((current - previous) * 100) / 100;
  if (diff === 0) {
    return (
      <p className="flex items-center gap-1 text-muted-foreground text-xs">
        <Minus className="size-3.5" aria-hidden="true" />
        No change {label}
      </p>
    );
  }
  const isUp = diff > 0;
  const isGood = isUp === (goodDirection === "up");
  const Icon = isUp ? ArrowUp : ArrowDown;
  return (
    <p
      className={cn(
        "flex items-center gap-1 text-xs",
        isGood ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400",
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>
        {isUp ? "Up" : "Down"} {format(Math.abs(diff))} {label} ({format(previous)})
      </span>
    </p>
  );
}
