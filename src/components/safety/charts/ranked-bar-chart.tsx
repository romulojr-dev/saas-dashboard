"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChartDataTable } from "../chart-data-table";
import { SERIES_COLORS } from "../chart-palette";

export interface RankedBarDatum {
  key: string;
  label: string;
  value: number;
}

/**
 * Horizontal bar chart for ranked categories (long labels stay readable). Values are
 * labelled at the bar ends, and a screen-reader table carries the same data.
 */
export function RankedBarChart({
  data,
  seriesLabel,
  caption,
  slot = 0,
  formatValue = (value) => String(value),
  labelWidth = 170,
}: {
  data: RankedBarDatum[];
  seriesLabel: string;
  caption: string;
  slot?: number;
  formatValue?: (value: number) => string;
  labelWidth?: number;
}) {
  const config = { value: { label: seriesLabel, theme: SERIES_COLORS[slot] } } satisfies ChartConfig;
  const height = Math.max(120, data.length * 34 + 16);

  return (
    <>
      <ChartContainer
        config={config}
        className="aspect-auto w-full"
        style={{ height }}
        role="img"
        aria-label={`${caption}: ${data.map((d) => `${d.label} ${formatValue(d.value)}`).join(", ")}.`}
      >
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 72, top: 0, bottom: 0 }} barCategoryGap={6}>
          <CartesianGrid horizontal={false} />
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis
            type="category"
            dataKey="label"
            width={labelWidth}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel={false} />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} minPointSize={2} isAnimationActive={false}>
            <LabelList
              dataKey="value"
              position="right"
              className="fill-foreground"
              fontSize={12}
              formatter={(value) => formatValue(Number(value))}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
      <ChartDataTable
        caption={caption}
        headers={["Item", seriesLabel]}
        rows={data.map((d) => [d.label, formatValue(d.value)])}
      />
    </>
  );
}
