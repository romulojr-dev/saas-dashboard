"use client";

import { ChartLine } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CardStatusProps } from "@/components/safety/card-states";
import { type SeriesDef, TrendLineChart } from "@/components/safety/charts/time-series";
import { SafetyCard } from "@/components/safety/safety-card";
import type { SafetyFilters, WorkforceData } from "@/types";

type View = "weekly" | "monthly";

const series: SeriesDef[] = [
  { key: "hazardEvents", label: "All hazard events", slot: 0 },
  { key: "ppeViolations", label: "PPE violations", slot: 1 },
  { key: "nearMisses", label: "Near-misses", slot: 2 },
];

export function SafetyTrend({
  data,
  status,
}: {
  data: WorkforceData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
}) {
  const [view, setView] = useState<View>("weekly");

  return (
    <SafetyCard
      title="Safety Trend"
      description={
        view === "weekly"
          ? "Last 12 weeks (current week to date) · zone, crew and shift filters apply; date range does not"
          : "Last 6 months (current month to date, so its counts are partial) · zone, crew and shift filters apply; date range does not"
      }
      data={data}
      status={status}
      isEmpty={(d) => d.safetyTrend.weekly.length === 0 && d.safetyTrend.monthly.length === 0}
      empty={{ icon: ChartLine, title: "No trend data", description: "Trends appear once events have been recorded." }}
      loading={<Skeleton className="h-72 w-full" />}
    >
      {(d) => (
        <Tabs value={view} onValueChange={(value) => setView(value as View)} className="gap-3">
          <TabsList aria-label="Trend period" className="self-end">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          {(["weekly", "monthly"] as const).map((period) => (
            <TabsContent key={period} value={period}>
              <TrendLineChart
                data={d.safetyTrend[period]}
                series={series}
                granularity={period === "weekly" ? "week" : "month"}
                caption={`${period === "weekly" ? "Weekly" : "Monthly"} hazard events, PPE violations and near-misses`}
                height={280}
                integerTicks
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </SafetyCard>
  );
}
