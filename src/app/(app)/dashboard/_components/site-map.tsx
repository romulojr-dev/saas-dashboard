"use client";

import { MapPinOff } from "lucide-react";
import { useMemo } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CardEmpty, CardError, CardLoading, type CardStatusProps } from "@/components/safety/card-states";
import { MapLegend, SiteMap as SiteMapView } from "@/components/safety/site-map/site-map";
import { cn } from "@/lib/utils";
import type { SiteOverview } from "@/types";

export function SiteMap({
  data,
  status,
  className,
}: {
  data: SiteOverview | null;
  status: CardStatusProps;
  className?: string;
}) {
  const alertWorkerIds = useMemo(() => new Set(data?.alerts.map((alert) => alert.workerId)), [data]);

  let body: React.ReactNode;
  if (data && data.workers.length === 0) {
    body = (
      <CardEmpty icon={MapPinOff} title="No worker positions" description="No hard hats are reporting a GPS location." />
    );
  } else if (data) {
    const flaggedCount = data.workers.filter((worker) => alertWorkerIds.has(worker.id)).length;
    body = (
      <>
        <SiteMapView
          summary={`Live site map: ${data.workers.length} workers, ${flaggedCount} with active alerts, ${data.geofences.length} restricted zones.`}
          project={data.project}
          workers={data.workers}
          geofences={data.geofences}
          alertWorkerIds={alertWorkerIds}
          referenceTime={data.generatedAt}
        />
        <MapLegend />
      </>
    );
  } else if (status.error) {
    body = <CardError error={status.error} onRetry={status.onRetry} />;
  } else {
    body = (
      <CardLoading label="site map">
        <Skeleton className="flex-1" />
      </CardLoading>
    );
  }

  return (
    <Card className={cn("min-h-0", className)}>
      <CardHeader>
        <CardTitle>Live Site Map</CardTitle>
        <CardDescription>
          {data
            ? `${data.workers.length} workers tracked · ${data.geofences.length} restricted zones`
            : "Hard-hat GPS positions"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">{body}</CardContent>
    </Card>
  );
}
