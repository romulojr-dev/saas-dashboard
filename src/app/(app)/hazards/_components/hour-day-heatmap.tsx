"use client";

import { CalendarClock } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { SEQUENTIAL_BLUE, sequentialColor } from "@/components/safety/chart-palette";
import { SafetyCard } from "@/components/safety/safety-card";
import { describeRange } from "@/lib/safety-filters";
import type { HazardsData, SafetyFilters } from "@/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const pad = (hour: number) => String(hour).padStart(2, "0");

/**
 * Hour × weekday grid. A real <table> so screen readers can navigate by row/column;
 * each cell also shows its count, so colour isn't the only signal.
 */
export function HourDayHeatmap({
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
      title="Hazard Events by Hour and Day"
      description={`When camera detections happen · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.hourDay.every((cell) => cell.count === 0)}
      empty={{ icon: CalendarClock, title: "No hazard events", description: "No detections match the current filters." }}
      loading={<Skeleton className="h-56 w-full" />}
    >
      {(d) => {
        const max = d.hourDay.reduce((m, cell) => Math.max(m, cell.count), 0);
        return (
          <div className="flex flex-col gap-3">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-0.5 text-[11px]">
                <caption className="sr-only">Hazard events by hour of day (columns) and day of week (rows)</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-10">
                      <span className="sr-only">Day</span>
                    </th>
                    {HOURS.map((hour) => (
                      <th key={hour} scope="col" className="font-normal text-muted-foreground">
                        <span aria-hidden="true">{hour % 3 === 0 ? pad(hour) : ""}</span>
                        <span className="sr-only">{pad(hour)}:00</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WEEKDAYS.map((day, weekday) => (
                    <tr key={day}>
                      <th scope="row" className="pr-1 text-left font-normal text-muted-foreground">
                        {day}
                      </th>
                      {HOURS.map((hour) => {
                        const count = d.hourDay[weekday * 24 + hour]?.count ?? 0;
                        // White text only on the darker ramp steps (>= #256abf), where it clears 4.5:1.
                        const dark = max > 0 && count / max >= 4 / 7;
                        return (
                          <td
                            key={hour}
                            title={`${day} ${pad(hour)}:00 — ${count} events`}
                            className="h-7 rounded-xs text-center tabular-nums"
                            style={{
                              background: count === 0 ? "var(--muted)" : sequentialColor(count, max),
                              color: count === 0 ? "var(--muted-foreground)" : dark ? "#fff" : "#0b0b0b",
                            }}
                          >
                            {count > 0 ? count : <span className="opacity-40">·</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs" aria-hidden="true">
              Fewer
              <span
                className="h-3 w-24 rounded-sm"
                style={{ background: `linear-gradient(to right, ${SEQUENTIAL_BLUE.join(", ")})` }}
              />
              More events
            </div>
          </div>
        );
      }}
    </SafetyCard>
  );
}
