"use client";

import { ShieldCheck } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { RankedBarChart } from "@/components/safety/charts/ranked-bar-chart";
import { SafetyCard } from "@/components/safety/safety-card";
import { describeRange } from "@/lib/safety-filters";
import type { LocationData, SafetyFilters } from "@/types";

export function BreachesByZone({
  data,
  status,
  filters,
}: {
  data: LocationData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
}) {
  return (
    <SafetyCard
      title="Breaches by Zone"
      description={`Restricted-zone entries · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.breachesByZone.every((row) => row.count === 0)}
      empty={{
        icon: ShieldCheck,
        title: "No breaches",
        description: "No restricted-zone entries match the current filters.",
      }}
      loading={<Skeleton className="h-40 w-full" />}
    >
      {(d) => (
        <RankedBarChart
          data={d.breachesByZone.map((row) => ({ key: row.key, label: row.label, value: row.count }))}
          seriesLabel="Breaches"
          caption="Restricted-zone breaches by zone"
        />
      )}
    </SafetyCard>
  );
}
