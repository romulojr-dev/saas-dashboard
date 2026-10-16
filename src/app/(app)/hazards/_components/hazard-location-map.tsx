"use client";

import { MapPinOff } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { SafetyCard } from "@/components/safety/safety-card";
import { MapLegend, SiteMap } from "@/components/safety/site-map/site-map";
import { describeRange } from "@/lib/safety-filters";
import type { HazardsData, SafetyFilters } from "@/types";

const NO_WORKERS = new Set<string>();

export function HazardLocationMap({
  data,
  status,
  filters,
}: {
  data: HazardsData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
}) {
  return (
    <SafetyCard
      title="Hazard Events by Location"
      description={`Where camera detections were raised · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.locationDensity.length === 0}
      empty={{ icon: MapPinOff, title: "No hazard locations", description: "No detections match the current filters." }}
      loading={<Skeleton className="h-96 w-full" />}
      contentClassName="gap-3"
    >
      {(d) => {
        const total = d.locationDensity.reduce((sum, cell) => sum + cell.count, 0);
        const busiest = d.locationDensity.reduce((max, cell) => Math.max(max, cell.count), 0);
        return (
          <>
            <SiteMap
              summary={`Heat map of ${total} hazard events over ${d.locationDensity.length} grid cells of about 11 metres; the busiest cell has ${busiest} events.`}
              className="relative isolate h-96 overflow-hidden rounded-lg ring-1 ring-foreground/10"
              project={d.project}
              workers={[]}
              geofences={d.geofences}
              alertWorkerIds={NO_WORKERS}
              referenceTime={d.generatedAt}
              density={d.locationDensity}
              showDensity
              showWorkers={false}
              densityLabel={(count) => `${count} hazard events`}
            />
            <MapLegend showWorkers={false} showDensity densityTitle="Hazard events" />
          </>
        );
      }}
    </SafetyCard>
  );
}
