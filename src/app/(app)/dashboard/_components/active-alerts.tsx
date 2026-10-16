import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SafetyAlert } from "@/types";
import { CardEmpty, CardError, CardLoading, type CardStatusProps } from "@/components/safety/card-states";
import { formatClock, formatRelative } from "@/components/safety/format";
import { SeverityBadge } from "@/components/safety/severity-badge";

function AlertItem({ alert, referenceTime }: { alert: SafetyAlert; referenceTime: string }) {
  return (
    <li className="flex items-start justify-between gap-3 border-b py-3 last:border-b-0">
      <div className="min-w-0 space-y-1.5">
        <SeverityBadge severity={alert.severity} />
        <p className="font-medium leading-snug">{alert.type}</p>
        <p className="text-muted-foreground text-xs">
          <span className="sr-only">Worker </span>
          {alert.workerId} · {alert.zone}
        </p>
      </div>
      <div className="shrink-0 text-right text-xs">
        <time dateTime={alert.createdAt} className="block font-medium tabular-nums">
          {formatClock(alert.createdAt)}
        </time>
        <span className="text-muted-foreground">{formatRelative(alert.createdAt, referenceTime)}</span>
      </div>
    </li>
  );
}

export function ActiveAlerts({
  alerts,
  referenceTime,
  status,
  className,
}: {
  alerts: SafetyAlert[] | null;
  referenceTime: string | null;
  status: CardStatusProps;
  className?: string;
}) {
  let body: React.ReactNode;
  if (alerts && referenceTime) {
    body =
      alerts.length === 0 ? (
        <CardEmpty icon={ShieldCheck} title="No active alerts" description="All workers are clear of reported hazards." />
      ) : (
        <ScrollArea className="h-full">
          {/* Alerts arrive newest first; additions are announced politely to screen readers. */}
          <ol aria-live="polite" aria-relevant="additions" className="pr-3">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} referenceTime={referenceTime} />
            ))}
          </ol>
        </ScrollArea>
      );
  } else if (status.error) {
    body = <CardError error={status.error} onRetry={status.onRetry} />;
  } else {
    body = (
      <CardLoading label="active alerts">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="space-y-2 border-b pb-3 last:border-b-0">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </CardLoading>
    );
  }

  return (
    <Card className={cn("min-h-0", className)}>
      <CardHeader>
        <CardTitle>Active Alerts</CardTitle>
        <CardDescription>Newest first</CardDescription>
        {alerts && (
          <CardAction>
            <Badge variant="outline" className="tabular-nums">
              {alerts.length} open
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="min-h-0 flex-1">{body}</CardContent>
    </Card>
  );
}
