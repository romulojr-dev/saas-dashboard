"use client";

import { BatteryWarning, CameraOff, HardHat, Satellite } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import type { CardStatusProps } from "@/components/safety/card-states";
import { KpiCard, KpiNote, KpiValue } from "@/components/safety/kpi-card";
import { cn } from "@/lib/utils";
import type { DevicesData, SafetyFilters } from "@/types";

const onlineConfig = {
  online: { label: "Online", theme: { light: "#15803d", dark: "#4ade80" } },
  offline: { label: "Offline", theme: { light: "#b91c1c", dark: "#f87171" } },
} satisfies ChartConfig;

/** Small two-slice donut; the numbers beside it carry the meaning. */
function OnlineDonut({ online, offline }: { online: number; offline: number }) {
  const slices = [
    { key: "online", count: online },
    { key: "offline", count: offline },
  ].filter((slice) => slice.count > 0);
  return (
    <ChartContainer config={onlineConfig} className="aspect-square h-16 shrink-0" aria-hidden="true">
      <PieChart>
        <Pie
          data={slices}
          dataKey="count"
          nameKey="key"
          innerRadius="60%"
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
  );
}

export function DeviceKpis({
  data,
  status,
}: {
  data: DevicesData | null;
  filters: SafetyFilters;
  status: CardStatusProps;
}) {
  const kpis = data?.kpis ?? null;

  return (
    <section aria-label="Device health indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="Helmets Online" icon={HardHat} data={kpis} status={status}>
        {({ online, offline }) => {
          const total = online + offline;
          const pct = total ? Math.round((online / total) * 100) : 0;
          return total === 0 ? (
            <>
              <KpiValue value="—" />
              <KpiNote>No helmets match the filters</KpiNote>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <OnlineDonut online={online} offline={offline} />
              <div className="space-y-1">
                <KpiValue value={`${pct}%`} />
                <KpiNote>
                  <span className="font-medium text-foreground">{online}</span> online /{" "}
                  <span className={cn("font-medium", offline > 0 ? "text-red-700 dark:text-red-400" : "text-foreground")}>
                    {offline}
                  </span>{" "}
                  offline
                </KpiNote>
              </div>
            </div>
          );
        }}
      </KpiCard>

      <KpiCard title="Low-Battery Devices" icon={BatteryWarning} data={data} status={status}>
        {({ kpis: { lowBattery }, thresholds }) => (
          <>
            <KpiValue value={lowBattery} className={cn(lowBattery > 0 && "text-amber-700 dark:text-amber-400")} />
            <KpiNote>Below {thresholds.lowBatteryPct}% · live</KpiNote>
          </>
        )}
      </KpiCard>

      <KpiCard title="GPS Signal Quality" icon={Satellite} data={kpis} status={status}>
        {({ gpsQuality }) =>
          gpsQuality === null ? (
            <>
              <KpiValue value="—" />
              <KpiNote>No online helmets with a GPS fix</KpiNote>
            </>
          ) : (
            <>
              <KpiValue value={`${gpsQuality}%`} />
              <Progress value={gpsQuality} aria-label={`GPS signal quality ${gpsQuality}%`} className="my-1" />
              <KpiNote>Average fix quality of online helmets</KpiNote>
            </>
          )
        }
      </KpiCard>

      <KpiCard title="Camera Obstruction / Blackout" icon={CameraOff} data={kpis} status={status}>
        {({ cameraEventsToday }) => (
          <>
            <KpiValue value={cameraEventsToday} />
            <KpiNote>Events since midnight</KpiNote>
          </>
        )}
      </KpiCard>
    </section>
  );
}
