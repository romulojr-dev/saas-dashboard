"use client";

import { Timer } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { RankedBarChart } from "@/components/safety/charts/ranked-bar-chart";
import { SafetyCard } from "@/components/safety/safety-card";
import { describeRange } from "@/lib/safety-filters";
import type { LocationData, SafetyFilters } from "@/types";

export function HighRiskTime({
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
      title="Time in High-Risk Zones"
      description={`Top 10 workers by minutes inside restricted zones · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.highRiskTime.length === 0}
      empty={{ icon: Timer, title: "No time in high-risk zones", description: "No worker entered a restricted zone in this period." }}
      loading={<Skeleton className="h-64 w-full" />}
    >
      {(d) => (
        <RankedBarChart
          data={d.highRiskTime.map((row) => ({ key: row.workerId, label: `${row.workerId} · ${row.crew}`, value: row.minutes }))}
          seriesLabel="Minutes"
          caption="Minutes in restricted zones per worker, top 10"
          slot={1}
          formatValue={(minutes) => `${minutes.toFixed(1)} min`}
        />
      )}
    </SafetyCard>
  );
}
