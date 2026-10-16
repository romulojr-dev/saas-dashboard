"use client";

import { Wifi } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { TrendLineChart } from "@/components/safety/charts/time-series";
import { SafetyCard } from "@/components/safety/safety-card";
import type { DevicesData, SafetyFilters } from "@/types";

export function OnlineByHour({
  data,
  status,
}: {
  data: DevicesData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
}) {
  return (
    <SafetyCard
      title="Device Status, Last 24 Hours"
      description="Helmets online by hour · the latest hour is live"
      data={data}
      status={status}
      isEmpty={(d) => d.onlineByHour.length === 0}
      empty={{ icon: Wifi, title: "No device history", description: "No helmets match the current filters." }}
      loading={<Skeleton className="h-56 w-full" />}
    >
      {(d) => (
        <TrendLineChart
          data={d.onlineByHour}
          series={[{ key: "count", label: "Helmets online", slot: 0 }]}
          granularity="hour"
          caption="Helmets online by hour over the last 24 hours"
          integerTicks
        />
      )}
    </SafetyCard>
  );
}
