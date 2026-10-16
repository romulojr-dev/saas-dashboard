"use client";

import { Award } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { SafetyCard } from "@/components/safety/safety-card";
import { describeRange } from "@/lib/safety-filters";
import type { SafetyFilters, WorkforceData } from "@/types";

export function RepeatViolators({
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
      title="Repeat Violators — Top 10"
      description={`Ranked by violation count · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.topViolators.length === 0}
      empty={{
        icon: Award,
        title: "No repeat violators",
        description: `No worker reached ${data?.kpis.repeatThreshold ?? 3} violations in this period.`,
      }}
      loading={<Skeleton className="h-64 w-full" />}
    >
      {(d) => (
        <Table>
          <caption className="sr-only">
            Top repeat violators, ranked by number of PPE violations and restricted-zone breaches
          </caption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="w-12">
                Rank
              </TableHead>
              <TableHead scope="col">Worker ID</TableHead>
              <TableHead scope="col">Crew</TableHead>
              <TableHead scope="col" className="text-right">
                Violations
              </TableHead>
              <TableHead scope="col">Most common violation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {d.topViolators.map((row) => (
              <TableRow key={row.workerId}>
                <TableCell className="tabular-nums text-muted-foreground">#{row.rank}</TableCell>
                <TableCell className="font-medium">{row.workerId}</TableCell>
                <TableCell className="whitespace-nowrap">{row.crew}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{row.violations}</TableCell>
                <TableCell className="whitespace-nowrap">{row.mostCommon}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SafetyCard>
  );
}
