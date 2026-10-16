"use client";

import { ShieldCheck } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { TrendLineChart } from "@/components/safety/charts/time-series";
import { SafetyCard } from "@/components/safety/safety-card";
import { describeRange } from "@/lib/safety-filters";
import type { HazardsData, SafetyFilters } from "@/types";

export function ComplianceTrend({
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
      title="PPE Compliance Trend"
      description={`Share of worker-shifts with no PPE violation · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.complianceTrend.every((b) => b.rate === null)}
      empty={{ icon: ShieldCheck, title: "No compliance data", description: "No scheduled shifts in this period." }}
      loading={<Skeleton className="h-60 w-full" />}
    >
      {(d) => {
        const rates = d.complianceTrend.flatMap((b) => (b.rate === null ? [] : [b.rate]));
        // Zoom the axis to the data, but always keep the target in view.
        const floor = Math.max(0, Math.floor(Math.min(...rates, d.complianceTarget) / 5) * 5 - 5);
        return (
          <TrendLineChart
            data={d.complianceTrend}
            series={[{ key: "rate", label: "PPE compliance", slot: 0 }]}
            granularity={d.granularity}
            caption={`PPE compliance per ${d.granularity}, target ${d.complianceTarget}%`}
            yDomain={[floor, 100]}
            formatValue={(value) => `${value}%`}
            referenceLine={{ y: d.complianceTarget, label: `Target ${d.complianceTarget}%` }}
          />
        );
      }}
    </SafetyCard>
  );
}
