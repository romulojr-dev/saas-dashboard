import type { LucideIcon } from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CardEmpty, CardError, CardLoading, type CardStatusProps } from "./card-states";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

/**
 * Card with a title that switches between loading, error, empty and content states.
 * `data` is null until the first response; `isEmpty` decides when to show the empty state.
 */
export function SafetyCard<T>({
  title,
  description,
  action,
  data,
  status,
  isEmpty,
  empty,
  loading,
  className,
  contentClassName,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  data: T | null;
  status: CardStatusProps;
  isEmpty?: (data: T) => boolean;
  empty: EmptyStateProps;
  loading?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: (data: T) => React.ReactNode;
}) {
  let body: React.ReactNode;
  if (data !== null) {
    body = isEmpty?.(data) ? <CardEmpty {...empty} /> : children(data);
  } else if (status.error) {
    body = <CardError error={status.error} onRetry={status.onRetry} />;
  } else {
    body = <CardLoading label={title}>{loading}</CardLoading>;
  }

  return (
    <Card className={cn("min-h-0 min-w-0", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && data !== null && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className={cn("flex min-h-0 min-w-0 flex-1 flex-col", contentClassName)}>{body}</CardContent>
    </Card>
  );
}
