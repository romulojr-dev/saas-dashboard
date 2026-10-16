"use client";

import { ShieldCheck } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { RankedBarChart } from "@/components/safety/charts/ranked-bar-chart";
import { SafetyCard } from "@/components/safety/safety-card";
import { describeRange } from "@/lib/safety-filters";
import type { SafetyFilters, WorkforceData } from "@/types";

export function ViolationsByCrew({
  data,
  status,
  filters,
}: {
  data: WorkforceData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
}) {
  return (
    <SafetyCard
      title="Violations by Crew / Subcontractor"
      description={`PPE violations + restricted-zone breaches · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.violationsByCrew.every((row) => row.count === 0)}
      empty={{ icon: ShieldCheck, title: "No violations", description: "No PPE or zone violations match the current filters." }}
      loading={<Skeleton className="h-56 w-full" />}
    >
      {(d) => (
        <RankedBarChart
          data={d.violationsByCrew.map((row) => ({ key: row.key, label: row.label, value: row.count }))}
          seriesLabel="Violations"
          caption="Violations by crew"
          slot={2}
        />
      )}
    </SafetyCard>
  );
}
