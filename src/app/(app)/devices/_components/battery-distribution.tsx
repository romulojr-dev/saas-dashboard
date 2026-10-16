"use client";

import { BatteryFull } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { CardStatusProps } from "@/components/safety/card-states";
import { ChartDataTable } from "@/components/safety/chart-data-table";
import { SERIES_COLORS } from "@/components/safety/chart-palette";
import { SafetyCard } from "@/components/safety/safety-card";
import type { DevicesData, SafetyFilters } from "@/types";

const config = { count: { label: "Devices", theme: SERIES_COLORS[0] } } satisfies ChartConfig;

export function BatteryDistribution({
  data,
  status,
}: {
  data: DevicesData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
}) {
  return (
    <SafetyCard
      title="Battery Level Distribution"
      description="Number of helmets per battery band · live"
      data={data}
      status={status}
      isEmpty={(d) => d.batteryBuckets.every((bucket) => bucket.count === 0)}
      empty={{ icon: BatteryFull, title: "No devices", description: "No helmets match the current filters." }}
      loading={<Skeleton className="h-56 w-full" />}
    >
      {(d) => {
        // Name the low band in the axis label so its meaning doesn't depend on colour.
        const rows = d.batteryBuckets.map((bucket) => ({
          ...bucket,
          label: bucket.key === "0-20" ? `${bucket.label} (low)` : bucket.label,
        }));
        return (
          <>
            <ChartContainer
              config={config}
              className="aspect-auto h-56 w-full"
              role="img"
              aria-label={`Bar chart of helmets by battery level: ${rows.map((r) => `${r.label} ${r.count}`).join(", ")}.`}
            >
              <BarChart data={rows} margin={{ left: 0, right: 12, top: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={0} />
                <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} minPointSize={2} isAnimationActive={false}>
                  <LabelList dataKey="count" position="top" className="fill-foreground" fontSize={12} />
                </Bar>
              </BarChart>
            </ChartContainer>
            <ChartDataTable
              caption="Helmets by battery level"
              headers={["Battery level", "Devices"]}
              rows={rows.map((row) => [row.label, row.count])}
            />
          </>
        );
      }}
    </SafetyCard>
  );
}
