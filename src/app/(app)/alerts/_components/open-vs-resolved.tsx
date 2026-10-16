"use client";

import { BellOff } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { type SeriesDef, StackedBarChart } from "@/components/safety/charts/time-series";
import { SafetyCard } from "@/components/safety/safety-card";
import { describeRange } from "@/lib/safety-filters";
import type { AlertsData, SafetyFilters } from "@/types";

const series: SeriesDef[] = [
  { key: "resolved", label: "Resolved", slot: 0 },
  { key: "open", label: "Still open", slot: 1 },
];

export function OpenVsResolved({
  data,
  status,
  filters,
}: {
  data: AlertsData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
}) {
  return (
    <SafetyCard
      title="Open vs. Resolved"
      description={`Alerts raised, by current status · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.openVsResolved.every((b) => b.open + b.resolved === 0)}
      empty={{ icon: BellOff, title: "No alerts", description: "No alerts match the current filters." }}
      loading={<Skeleton className="h-56 w-full" />}
    >
      {(d) => (
        <StackedBarChart
          data={d.openVsResolved}
          series={series}
          granularity={d.granularity}
          caption={`Alerts raised per ${d.granularity}, resolved and still open`}
          height={220}
        />
      )}
    </SafetyCard>
  );
}
