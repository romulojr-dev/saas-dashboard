"use client";

import { Timer } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { TrendLineChart } from "@/components/safety/charts/time-series";
import { SafetyCard } from "@/components/safety/safety-card";
import { describeRange } from "@/lib/safety-filters";
import type { AlertsData, SafetyFilters } from "@/types";

export function ResponseTrend({
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
      title="Response Time Trend"
      description={`Mean minutes from raised to acknowledged · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.responseTrend.every((b) => b.minutes === null)}
      empty={{ icon: Timer, title: "No responses yet", description: "No alerts were acknowledged in this period." }}
      loading={<Skeleton className="h-56 w-full" />}
    >
      {(d) => (
        <TrendLineChart
          data={d.responseTrend}
          series={[{ key: "minutes", label: "Response time", slot: 0 }]}
          granularity={d.granularity}
          caption={`Mean response time in minutes per ${d.granularity}`}
          formatValue={(value) => `${Math.round(value * 10) / 10}m`}
        />
      )}
    </SafetyCard>
  );
}
