"use client";

import { Flame, MapPinOff } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { SafetyCard } from "@/components/safety/safety-card";
import { MapLegend, SiteMap } from "@/components/safety/site-map/site-map";
import { describeRange } from "@/lib/safety-filters";
import type { LocationData, SafetyFilters } from "@/types";

export function LiveMapCard({
  data,
  status,
  filters,
  className,
}: {
  data: LocationData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
  className?: string;
}) {
  const [showDensity, setShowDensity] = useState(false);
  const alertWorkerIds = useMemo(() => new Set(data?.alertWorkerIds), [data]);

  return (
    <SafetyCard
      title="Live Site Map"
      description={
        data
          ? `${data.workers.length} workers live · ${data.geofences.length} restricted zones${showDensity ? ` · density: ${describeRange(filters)}` : ""}`
          : "Hard-hat GPS positions"
      }
      action={
        <Button
          variant={showDensity ? "secondary" : "outline"}
          size="sm"
          aria-pressed={showDensity}
          onClick={() => setShowDensity((on) => !on)}
        >
          <Flame aria-hidden="true" />
          Heat map {showDensity ? "on" : "off"}
        </Button>
      }
      data={data}
      status={status}
      isEmpty={(d) => d.workers.length === 0 && d.density.length === 0}
      empty={{ icon: MapPinOff, title: "No worker positions", description: "No hard hats match the current filters." }}
      loading={<Skeleton className="flex-1" />}
      className={className}
      contentClassName="gap-3"
    >
      {(d) => {
        const flagged = d.workers.filter((worker) => alertWorkerIds.has(worker.id)).length;
        const totalFixes = d.density.reduce((sum, cell) => sum + cell.count, 0);
        return (
          <>
            <SiteMap
              summary={`Live site map: ${d.workers.length} workers, ${flagged} with active alerts, ${d.geofences.length} restricted zones.${
                showDensity ? ` Worker-density heat map shown: ${totalFixes} GPS fixes over ${d.density.length} grid cells.` : ""
              }`}
              project={d.project}
              workers={d.workers}
              geofences={d.geofences}
              alertWorkerIds={alertWorkerIds}
              referenceTime={d.generatedAt}
              density={d.density}
              showDensity={showDensity}
              densityLabel={(count) => `${count} GPS fixes (${describeRange(filters)})`}
            />
            <MapLegend showDensity={showDensity} densityTitle="Worker density" />
          </>
        );
      }}
    </SafetyCard>
  );
}
