"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { BucketGranularity } from "@/types";
import { ChartDataTable } from "../chart-data-table";
import { LegendList } from "../chart-legend";
import { SERIES_COLORS } from "../chart-palette";
import { formatBucketLabel, formatBucketTick } from "../format";

export interface SeriesDef {
  key: string;
  label: string;
  /** Categorical palette slot; keep slots in order across a chart. */
  slot: number;
}

interface TimeSeriesProps<T extends { start: string }> {
  data: T[];
  series: SeriesDef[];
  granularity: BucketGranularity;
  /** Names the chart for screen readers and captions the data table. */
  caption: string;
  height?: number;
  formatValue?: (value: number) => string;
  yDomain?: [number | string, number | string];
  /** Optional dashed horizontal line, e.g. a target. */
  referenceLine?: { y: number; label: string };
  /** Whole-number axis ticks (for counts). */
  integerTicks?: boolean;
}

function valueOf<T>(row: T, key: string) {
  const value = (row as Record<string, unknown>)[key];
  return typeof value === "number" ? value : null;
}

function buildConfig(series: SeriesDef[]) {
  return Object.fromEntries(series.map((s) => [s.key, { label: s.label, theme: SERIES_COLORS[s.slot] }])) satisfies ChartConfig;
}

function Legend({ series }: { series: SeriesDef[] }) {
  if (series.length < 2) return null; // a single series is named by the card title
  return (
    <LegendList
      layout="inline"
      items={series.map((s) => ({ key: s.key, label: s.label, color: SERIES_COLORS[s.slot] }))}
    />
  );
}

function DataTableFor<T extends { start: string }>({
  data,
  series,
  granularity,
  caption,
  formatValue,
}: Pick<TimeSeriesProps<T>, "data" | "series" | "granularity" | "caption"> & { formatValue: (value: number) => string }) {
  return (
    <ChartDataTable
      caption={caption}
      headers={["Period", ...series.map((s) => s.label)]}
      rows={data.map((row) => [
        formatBucketLabel(row.start, granularity),
        ...series.map((s) => {
          const value = valueOf(row, s.key);
          return value === null ? "No data" : formatValue(value);
        }),
      ])}
    />
  );
}

const tooltipLabel =
  (granularity: BucketGranularity) =>
  (_: unknown, payload: readonly { payload?: { start?: string } }[] | undefined) => {
    const start = payload?.[0]?.payload?.start;
    return start ? formatBucketLabel(start, granularity) : null;
  };

/** Line chart over time buckets, with a crosshair tooltip and an optional dashed reference line. */
export function TrendLineChart<T extends { start: string }>({
  data,
  series,
  granularity,
  caption,
  height = 220,
  formatValue = (value) => String(value),
  yDomain = [0, "auto"],
  referenceLine,
  integerTicks = false,
}: TimeSeriesProps<T>) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <ChartContainer
        config={buildConfig(series)}
        className="aspect-auto w-full"
        style={{ height }}
        role="img"
        aria-label={`Line chart: ${caption}. Values are listed in the table that follows.`}
      >
        <LineChart data={data} margin={{ left: 0, right: 12, top: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="start"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={20}
            tickFormatter={(value: string) => formatBucketTick(value, granularity)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            domain={yDomain}
            allowDecimals={!integerTicks}
            tickFormatter={formatValue}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={tooltipLabel(granularity)}
                formatter={(value, name) => (
                  <div className="flex w-full justify-between gap-3">
                    <span className="text-muted-foreground">{series.find((s) => s.key === name)?.label ?? name}</span>
                    <span className="font-medium font-mono tabular-nums">{formatValue(Number(value))}</span>
                  </div>
                )}
              />
            }
          />
          {referenceLine && (
            <ReferenceLine
              y={referenceLine.y}
              stroke="var(--muted-foreground)"
              strokeDasharray="6 4"
              label={{ value: referenceLine.label, position: "insideTopRight", fontSize: 12, fill: "var(--muted-foreground)" }}
            />
          )}
          {series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              // Straight segments: smoothing would invent values between buckets.
              type="linear"
              stroke={`var(--color-${s.key})`}
              strokeWidth={2}
              dot={data.length <= 12 ? { r: 3, fill: `var(--color-${s.key})` } : false}
              activeDot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ChartContainer>
      <Legend series={series} />
      <DataTableFor data={data} series={series} granularity={granularity} caption={caption} formatValue={formatValue} />
    </div>
  );
}

/** Stacked bar chart over time buckets; segments are separated by a thin surface gap. */
export function StackedBarChart<T extends { start: string }>({
  data,
  series,
  granularity,
  caption,
  height = 240,
  formatValue = (value) => String(value),
}: TimeSeriesProps<T>) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <ChartContainer
        config={buildConfig(series)}
        className="aspect-auto w-full"
        style={{ height }}
        role="img"
        aria-label={`Stacked bar chart: ${caption}. Values are listed in the table that follows.`}
      >
        <BarChart data={data} margin={{ left: 0, right: 12, top: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="start"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={20}
            tickFormatter={(value: string) => formatBucketTick(value, granularity)}
          />
          <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} tickFormatter={formatValue} />
          <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<ChartTooltipContent labelFormatter={tooltipLabel(granularity)} />} />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              stackId="stack"
              fill={`var(--color-${s.key})`}
              stroke="var(--card)"
              strokeWidth={1}
              radius={i === series.length - 1 ? [4, 4, 0, 0] : 0}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ChartContainer>
      <Legend series={series} />
      <DataTableFor data={data} series={series} granularity={granularity} caption={caption} formatValue={formatValue} />
    </div>
  );
}
