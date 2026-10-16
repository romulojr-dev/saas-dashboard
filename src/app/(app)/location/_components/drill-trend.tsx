"use client";

import { Siren } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { CardStatusProps } from "@/components/safety/card-states";
import { ChartDataTable } from "@/components/safety/chart-data-table";
import { SERIES_COLORS } from "@/components/safety/chart-palette";
import { formatShortDate } from "@/components/safety/format";
import { ChangeIndicator, KpiValue } from "@/components/safety/kpi-card";
import { SafetyCard } from "@/components/safety/safety-card";
import type { LocationData, SafetyFilters } from "@/types";

const chartConfig = {
  musterMinutes: { label: "Muster time (min)", theme: SERIES_COLORS[0] },
} satisfies ChartConfig;

export function DrillTrend({
  data,
  status,
  filters,
}: {
  data: LocationData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
}) {
  return (
    <SafetyCard
      title="Evacuation Drill Muster Time"
      description={`Minutes until every worker${filters.crew ? " in the selected crew" : ""} reached the muster point · last 5 drills (not limited by date range)`}
      data={data}
      status={status}
      isEmpty={(d) => d.drills.length === 0}
      empty={{ icon: Siren, title: "No drills recorded", description: "Muster times appear after the first evacuation drill." }}
      loading={<Skeleton className="h-48 w-full" />}
    >
      {(d) => {
        const latest = d.drills[d.drills.length - 1];
        const previous = d.drills.length > 1 ? d.drills[d.drills.length - 2] : null;
        return (
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="shrink-0 space-y-1 md:w-56">
              <p className="text-muted-foreground text-xs">Last drill · {formatShortDate(latest.date)}</p>
              <KpiValue value={latest.musterMinutes.toFixed(1)} unit="min" />
              {previous && (
                <ChangeIndicator
                  current={latest.musterMinutes}
                  previous={previous.musterMinutes}
                  label="vs previous drill"
                  format={(value) => `${value.toFixed(1)} min`}
                />
              )}
            </div>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-44 min-w-0 flex-1"
              role="img"
              aria-label={`Line chart of muster time over the last ${d.drills.length} drills: ${d.drills
                .map((drill) => `${formatShortDate(drill.date)} ${drill.musterMinutes.toFixed(1)} minutes`)
                .join(", ")}.`}
            >
              <LineChart data={d.drills} margin={{ left: 0, right: 16, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={formatShortDate} />
                <YAxis tickLine={false} axisLine={false} width={32} domain={[0, "auto"]} unit="m" />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(_, payload) => {
                        const date = payload?.[0]?.payload?.date;
                        return date ? `Drill on ${formatShortDate(date)}` : null;
                      }}
                    />
                  }
                />
                <Line
                  dataKey="musterMinutes"
                  type="monotone"
                  stroke="var(--color-musterMinutes)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-musterMinutes)" }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
            <ChartDataTable
              caption="Evacuation drill muster times"
              headers={["Drill date", "Muster time (minutes)"]}
              rows={d.drills.map((drill) => [formatShortDate(drill.date), drill.musterMinutes.toFixed(1)])}
            />
          </div>
        );
      }}
    </SafetyCard>
  );
}
