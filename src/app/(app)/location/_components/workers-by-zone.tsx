"use client";

import { Users } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { CardStatusProps } from "@/components/safety/card-states";
import { ChartDataTable } from "@/components/safety/chart-data-table";
import { LegendList } from "@/components/safety/chart-legend";
import { OTHER_COLOR, SERIES_COLORS } from "@/components/safety/chart-palette";
import { SafetyCard } from "@/components/safety/safety-card";
import type { CountByKey, LocationData } from "@/types";

const MAX_SLICES = 5;

/** Top zones keep their own slice; the rest fold into "Other" so the donut stays readable. */
function toSlices(rows: CountByKey[]) {
  const top = rows.slice(0, MAX_SLICES);
  const rest = rows.slice(MAX_SLICES).reduce((sum, row) => sum + row.count, 0);
  return rest > 0 ? [...top, { key: "other", label: "Other zones", count: rest }] : top;
}

export function WorkersByZone({
  data,
  status,
  className,
}: {
  data: LocationData | null;
  status: CardStatusProps;
  className?: string;
}) {
  return (
    <SafetyCard
      title="Workers by Zone"
      description="Live headcount from hard-hat GPS"
      data={data}
      status={status}
      isEmpty={(d) => d.workersByZone.length === 0}
      empty={{ icon: Users, title: "No workers on site", description: "No live positions match the current filters." }}
      loading={<Skeleton className="mx-auto aspect-square w-48 rounded-full" />}
      className={className}
    >
      {(d) => {
        const slices = toSlices(d.workersByZone);
        const total = slices.reduce((sum, slice) => sum + slice.count, 0);
        const config = Object.fromEntries(
          slices.map((slice, i) => [
            slice.key,
            { label: slice.label, theme: slice.key === "other" ? OTHER_COLOR : SERIES_COLORS[i] },
          ]),
        ) satisfies ChartConfig;

        return (
          <div className="flex flex-1 flex-col gap-4">
            <div className="relative">
              <ChartContainer
                config={config}
                className="mx-auto aspect-square h-52"
                role="img"
                aria-label={`Donut chart of ${total} workers by zone: ${slices.map((s) => `${s.label} ${s.count}`).join(", ")}.`}
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
                  <Pie
                    data={slices}
                    dataKey="count"
                    nameKey="key"
                    innerRadius="62%"
                    outerRadius="100%"
                    stroke="var(--card)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {slices.map((slice) => (
                      <Cell key={slice.key} fill={`var(--color-${slice.key})`} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
                <span className="font-heading text-3xl tabular-nums">{total}</span>
                <span className="text-muted-foreground text-xs">workers</span>
              </div>
            </div>

            {/* Legend doubles as direct labels: colour + name + count. */}
            <LegendList
              items={slices.map((slice, i) => ({
                key: slice.key,
                label: slice.label,
                color: slice.key === "other" ? OTHER_COLOR : SERIES_COLORS[i],
                value: slice.count,
              }))}
            />
            <ChartDataTable
              caption="Workers by zone"
              headers={["Zone", "Workers"]}
              rows={slices.map((slice) => [slice.label, slice.count])}
            />
          </div>
        );
      }}
    </SafetyCard>
  );
}
