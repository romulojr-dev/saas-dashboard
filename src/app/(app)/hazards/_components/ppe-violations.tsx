"use client";

import { HardHat } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { type SeriesDef, StackedBarChart } from "@/components/safety/charts/time-series";
import { SafetyCard } from "@/components/safety/safety-card";
import { describeRange } from "@/lib/safety-filters";
import type { HazardsData, SafetyFilters } from "@/types";

const series: SeriesDef[] = [
  { key: "noVest", label: "No hi-vis vest", slot: 0 },
  { key: "noHarness", label: "No harness at height", slot: 1 },
  { key: "noGloves", label: "No gloves", slot: 2 },
  { key: "noHardHat", label: "No hard hat (others)", slot: 3 },
];

export function PpeViolations({
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
      title="PPE Violations by Type"
      description={`Over time · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.ppeByPeriod.every((b) => b.noVest + b.noHarness + b.noGloves + b.noHardHat === 0)}
      empty={{ icon: HardHat, title: "No PPE violations", description: "No PPE violations match the current filters." }}
      loading={<Skeleton className="h-60 w-full" />}
    >
      {(d) => (
        <StackedBarChart
          data={d.ppeByPeriod}
          series={series}
          granularity={d.granularity}
          caption={`PPE violations by type per ${d.granularity}`}
        />
      )}
    </SafetyCard>
  );
}
