"use client";

import { TriangleAlert } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { CardStatusProps } from "@/components/safety/card-states";
import { ChartDataTable } from "@/components/safety/chart-data-table";
import { LegendList } from "@/components/safety/chart-legend";
import { SERIES_COLORS } from "@/components/safety/chart-palette";
import { SafetyCard } from "@/components/safety/safety-card";
import { describeRange } from "@/lib/safety-filters";
import type { HazardsData, SafetyFilters } from "@/types";

const config = {
  count: { label: "Detections", theme: SERIES_COLORS[0] },
  cumulativePct: { label: "Cumulative %", theme: SERIES_COLORS[1] },
} satisfies ChartConfig;

/**
 * Pareto chart: bars rank hazard types by count, the line shows the cumulative share.
 * The right-hand percentage axis is the standard Pareto form, the one place a second axis is used.
 */
export function HazardPareto({
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
      title="Hazard Types Detected"
      description={`Pareto of site hazards · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.pareto.every((row) => row.count === 0)}
      empty={{ icon: TriangleAlert, title: "No hazards detected", description: "No site hazards match the current filters." }}
      loading={<Skeleton className="h-64 w-full" />}
    >
      {(d) => (
        <div className="flex min-w-0 flex-col gap-2">
          <ChartContainer
            config={config}
            className="aspect-auto h-64 w-full"
            role="img"
            aria-label={`Pareto chart of hazard types: ${d.pareto
              .map((row) => `${row.type} ${row.count} (cumulative ${row.cumulativePct}%)`)
              .join(", ")}.`}
          >
            <ComposedChart data={d.pareto} margin={{ left: 0, right: 0, top: 12, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="type"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={64}
                tick={{ fontSize: 11 }}
              />
              <YAxis yAxisId="count" tickLine={false} axisLine={false} width={32} allowDecimals={false} />
              <YAxis
                yAxisId="pct"
                orientation="right"
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine
                yAxisId="pct"
                y={80}
                stroke="var(--muted-foreground)"
                strokeDasharray="6 4"
                label={{ value: "80% line", position: "insideBottomRight", fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <Bar yAxisId="count" dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Line
                yAxisId="pct"
                dataKey="cumulativePct"
                type="linear"
                stroke="var(--color-cumulativePct)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--color-cumulativePct)" }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ChartContainer>
          <LegendList
            layout="inline"
            items={[
              { key: "count", label: "Detections (left axis)", color: SERIES_COLORS[0] },
              { key: "pct", label: "Cumulative % (right axis)", color: SERIES_COLORS[1] },
            ]}
          />
          <ChartDataTable
            caption="Hazard types detected, most frequent first"
            headers={["Hazard type", "Detections", "Cumulative %"]}
            rows={d.pareto.map((row) => [row.type, row.count, `${row.cumulativePct}%`])}
          />
        </div>
      )}
    </SafetyCard>
  );
}
