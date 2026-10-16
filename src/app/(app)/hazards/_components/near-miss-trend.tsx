"use client";

import { Truck } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { TrendLineChart } from "@/components/safety/charts/time-series";
import { SafetyCard } from "@/components/safety/safety-card";
import { describeRange } from "@/lib/safety-filters";
import type { HazardsData, SafetyFilters } from "@/types";

export function NearMissTrend({
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
      title="Machinery Near-Misses Over Time"
      description={`Worker within the danger radius of moving plant · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.nearMissTrend.every((b) => b.count === 0)}
      empty={{ icon: Truck, title: "No near-misses", description: "No machinery near-misses match the current filters." }}
      loading={<Skeleton className="h-60 w-full" />}
    >
      {(d) => (
        <TrendLineChart
          data={d.nearMissTrend}
          series={[{ key: "count", label: "Near-misses", slot: 1 }]}
          granularity={d.granularity}
          caption={`Machinery near-misses per ${d.granularity}`}
          height={240}
          integerTicks
        />
      )}
    </SafetyCard>
  );
}
