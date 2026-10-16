"use client";

import { CircleCheck, OctagonAlert, TriangleAlert } from "lucide-react";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const LEVELS = {
  good: {
    label: "On target",
    icon: CircleCheck,
    color: { light: "#15803d", dark: "#4ade80" },
    text: "text-green-700 dark:text-green-400",
  },
  warning: {
    label: "Slightly below target",
    icon: TriangleAlert,
    color: { light: "#b45309", dark: "#fbbf24" },
    text: "text-amber-700 dark:text-amber-400",
  },
  critical: {
    label: "Below target",
    icon: OctagonAlert,
    color: { light: "#b91c1c", dark: "#f87171" },
    text: "text-red-700 dark:text-red-400",
  },
} as const;

/** Semicircle percentage gauge. Status vs target is shown as colour and as an icon + label. */
export function PercentGauge({
  value,
  target,
  label,
  warningBand = 5,
  className,
}: {
  value: number;
  target: number;
  label: string;
  /** How far below target still counts as "slightly below". */
  warningBand?: number;
  className?: string;
}) {
  const level = value >= target ? "good" : value >= target - warningBand ? "warning" : "critical";
  const { icon: Icon, ...style } = LEVELS[level];
  const config = { value: { label, theme: style.color } } satisfies ChartConfig;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-15 w-28 shrink-0 overflow-hidden">
        <ChartContainer
          config={config}
          className="aspect-auto h-28 w-28"
          role="img"
          aria-label={`${label}: ${value.toFixed(1)}%, target ${target}%. ${style.label}.`}
        >
          <RadialBarChart
            data={[{ value }]}
            startAngle={180}
            endAngle={0}
            innerRadius="72%"
            outerRadius="100%"
            cy="50%"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <RadialBar
              dataKey="value"
              fill="var(--color-value)"
              background={{ fill: "var(--muted)" }}
              cornerRadius={4}
              isAnimationActive={false}
            />
          </RadialBarChart>
        </ChartContainer>
      </div>
      <div className="min-w-0 space-y-1">
        <p className="font-heading text-3xl leading-none tracking-tight tabular-nums">{value.toFixed(1)}%</p>
        <p className={cn("flex items-center gap-1 font-medium text-xs", style.text)}>
          <Icon className="size-3.5 shrink-0" aria-hidden="true" />
          {style.label} ({target}%)
        </p>
      </div>
    </div>
  );
}
