"use client";

import { ArrowDown, ArrowUp, ChartLine, Minus } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { WeeklyHazardRate } from "@/types";
import { CardEmpty, CardError, CardLoading, type CardStatusProps } from "@/components/safety/card-states";

const chartConfig = {
  ratePer100WorkerHours: {
    label: "Events / 100 worker-hrs",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const weekFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const formatWeek = (iso: string) => weekFormatter.format(new Date(iso));

function WeekChange({ current, previous }: { current: number; previous: number }) {
  const diff = Math.round((current - previous) * 100) / 100;
  if (diff === 0) {
    return (
      <p className="flex items-center gap-1 text-muted-foreground text-xs">
        <Minus className="size-3.5" aria-hidden="true" />
        No change vs last week
      </p>
    );
  }
  // A falling rate is an improvement.
  const isUp = diff > 0;
  const Icon = isUp ? ArrowUp : ArrowDown;
  return (
    <p
      className={cn(
        "flex items-center gap-1 text-xs",
        isUp ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {isUp ? "Up" : "Down"} {Math.abs(diff).toFixed(2)} vs last week ({previous.toFixed(2)})
    </p>
  );
}

export function HazardRateTrend({
  trend,
  status,
  className,
}: {
  trend: WeeklyHazardRate[] | null;
  status: CardStatusProps;
  className?: string;
}) {
  let body: React.ReactNode;
  if (trend) {
    if (trend.length === 0) {
      body = <CardEmpty icon={ChartLine} title="No trend data yet" description="Weekly rates appear after the first full week." />;
    } else {
      const current = trend[trend.length - 1];
      const previous = trend.length > 1 ? trend[trend.length - 2] : null;
      const first = trend[0];
      body = (
        <div className="flex h-full flex-col gap-4">
          <div className="space-y-1">
            <p className="font-heading text-4xl leading-none tracking-tight tabular-nums">
              {current.ratePer100WorkerHours.toFixed(2)}
              <span className="sr-only"> hazard events per 100 worker-hours this week</span>
            </p>
            {previous && (
              <WeekChange current={current.ratePer100WorkerHours} previous={previous.ratePer100WorkerHours} />
            )}
          </div>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto min-h-56 w-full flex-1"
            role="img"
            aria-label={`Line chart of weekly hazard events per 100 worker-hours over ${trend.length} weeks, from ${first.ratePer100WorkerHours.toFixed(2)} in the week of ${formatWeek(first.weekStart)} to ${current.ratePer100WorkerHours.toFixed(2)} in the week of ${formatWeek(current.weekStart)}.`}
          >
            <LineChart data={trend} margin={{ left: 0, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="weekStart"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={formatWeek}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickMargin={4}
                domain={[0, "auto"]}
                tickFormatter={(value: number) => value.toFixed(1)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(_, payload) => {
                      const weekStart = payload?.[0]?.payload?.weekStart;
                      return weekStart ? `Week of ${formatWeek(weekStart)}` : null;
                    }}
                  />
                }
              />
              <Line
                dataKey="ratePer100WorkerHours"
                type="monotone"
                stroke="var(--color-ratePer100WorkerHours)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
          <table className="sr-only">
            <caption>Weekly hazard events per 100 worker-hours</caption>
            <thead>
              <tr>
                <th scope="col">Week of</th>
                <th scope="col">Rate</th>
              </tr>
            </thead>
            <tbody>
              {trend.map((week) => (
                <tr key={week.weekStart}>
                  <td>{formatWeek(week.weekStart)}</td>
                  <td>{week.ratePer100WorkerHours.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  } else if (status.error) {
    body = <CardError error={status.error} onRetry={status.onRetry} />;
  } else {
    body = (
      <CardLoading label="hazard rate trend">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-56 w-full" />
      </CardLoading>
    );
  }

  return (
    <Card className={cn("min-h-0", className)}>
      <CardHeader>
        <CardTitle>Hazard Events per 100 Worker-Hours</CardTitle>
        <CardDescription>This week, with the weekly trend over the last 12 weeks</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">{body}</CardContent>
    </Card>
  );
}
