"use client";

import { Users } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { OTHER_COLOR, SERIES_COLORS } from "@/components/safety/chart-palette";
import { DonutChart, type DonutSlice } from "@/components/safety/charts/donut-chart";
import { SafetyCard } from "@/components/safety/safety-card";
import type { CountByKey, LocationData } from "@/types";

const MAX_SLICES = 5;

/** Top zones keep their own slice; the rest fold into "Other" so the donut stays readable. */
function toSlices(rows: CountByKey[]): DonutSlice[] {
  const top = rows.slice(0, MAX_SLICES).map((row, i) => ({ ...row, color: SERIES_COLORS[i] }));
  const rest = rows.slice(MAX_SLICES).reduce((sum, row) => sum + row.count, 0);
  return rest > 0 ? [...top, { key: "other", label: "Other zones", count: rest, color: OTHER_COLOR }] : top;
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
      {(d) => <DonutChart slices={toSlices(d.workersByZone)} caption="workers by zone" centerLabel="workers" />}
    </SafetyCard>
  );
}
