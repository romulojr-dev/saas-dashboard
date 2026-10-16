"use client";

import { ChartLine } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { TrendLineChart } from "@/components/safety/charts/time-series";
import { SafetyCard } from "@/components/safety/safety-card";
import type { SafetyFilters, WorkforceData } from "@/types";

export function WeeklyRateTrend({
  data,
  status,
}: {
  data: WorkforceData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
}) {
  return (
    <SafetyCard
      title="Hazard Events per 100 Worker-Hours"
      description="Weekly, last 12 weeks · zone, crew and shift filters apply; date range does not"
      data={data}
      status={status}
      isEmpty={(d) => d.weeklyRate.length === 0}
      empty={{ icon: ChartLine, title: "No trend data", description: "Weekly rates appear after the first full week." }}
      loading={<Skeleton className="h-64 w-full" />}
    >
      {(d) => (
        <TrendLineChart
          data={d.weeklyRate.map((week) => ({ start: week.weekStart, rate: week.ratePer100WorkerHours }))}
          series={[{ key: "rate", label: "Events / 100 worker-hours", slot: 0 }]}
          granularity="week"
          caption="Hazard events per 100 worker-hours by week"
          height={260}
          formatValue={(value) => value.toFixed(1)}
        />
      )}
    </SafetyCard>
  );
}
