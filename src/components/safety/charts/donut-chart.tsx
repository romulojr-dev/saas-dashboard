"use client";

import { Cell, Pie, PieChart } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { ChartDataTable } from "../chart-data-table";
import { LegendList, type ThemedColor } from "../chart-legend";

export interface DonutSlice {
  key: string;
  label: string;
  count: number;
  color: ThemedColor;
}

/**
 * Donut with the total in the middle and a legend listing every slice with its count
 * (direct labels, so identity never relies on colour). Slices are separated by a surface gap.
 */
export function DonutChart({
  slices,
  caption,
  centerLabel,
  size = "h-52",
  showLegend = true,
  className,
}: {
  slices: DonutSlice[];
  caption: string;
  centerLabel: string;
  size?: string;
  showLegend?: boolean;
  className?: string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const config = Object.fromEntries(
    slices.map((slice) => [slice.key, { label: slice.label, theme: slice.color }]),
  ) satisfies ChartConfig;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="relative">
        <ChartContainer
          config={config}
          className={cn("mx-auto aspect-square", size)}
          role="img"
          aria-label={`Donut chart, ${caption}: ${slices.map((s) => `${s.label} ${s.count}`).join(", ")}; total ${total}.`}
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
            <Pie
              data={slices.filter((slice) => slice.count > 0)}
              dataKey="count"
              nameKey="key"
              innerRadius="62%"
              outerRadius="100%"
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices
                .filter((slice) => slice.count > 0)
                .map((slice) => (
                  <Cell key={slice.key} fill={`var(--color-${slice.key})`} />
                ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
          <span className="font-heading text-3xl tabular-nums">{total}</span>
          <span className="text-muted-foreground text-xs">{centerLabel}</span>
        </div>
      </div>
      {showLegend && (
        <LegendList items={slices.map((slice) => ({ key: slice.key, label: slice.label, color: slice.color, value: slice.count }))} />
      )}
      <ChartDataTable caption={caption} headers={["Category", "Count"]} rows={slices.map((slice) => [slice.label, slice.count])} />
    </div>
  );
}
