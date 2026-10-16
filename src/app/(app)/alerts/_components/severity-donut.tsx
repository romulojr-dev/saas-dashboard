"use client";

import { BellOff } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { SEVERITY_COLORS } from "@/components/safety/chart-palette";
import { DonutChart } from "@/components/safety/charts/donut-chart";
import { SafetyCard } from "@/components/safety/safety-card";
import { describeRange } from "@/lib/safety-filters";
import type { AlertsData, SafetyFilters } from "@/types";

export function SeverityDonut({
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
      title="Alerts by Severity"
      description={describeRange(filters)}
      data={data}
      status={status}
      isEmpty={(d) => d.bySeverity.every((row) => row.count === 0)}
      empty={{ icon: BellOff, title: "No alerts", description: "No alerts match the current filters." }}
      loading={<Skeleton className="mx-auto aspect-square w-44 rounded-full" />}
    >
      {(d) => (
        <DonutChart
          size="h-44"
          caption="alerts by severity"
          centerLabel="alerts"
          slices={d.bySeverity.map((row) => ({
            key: row.severity.toLowerCase(),
            label: row.severity,
            count: row.count,
            color: SEVERITY_COLORS[row.severity],
          }))}
        />
      )}
    </SafetyCard>
  );
}
