import { BellRing, CircleCheckBig, OctagonAlert, Timer } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { CardStatusProps } from "@/components/safety/card-states";
import { ChangeIndicator, KpiCard, KpiNote, KpiValue } from "@/components/safety/kpi-card";
import { describeRange } from "@/lib/safety-filters";
import { cn } from "@/lib/utils";
import type { AlertsData, SafetyFilters } from "@/types";

export function AlertKpis({
  data,
  filters,
  status,
}: {
  data: AlertsData | null;
  filters: SafetyFilters;
  status: CardStatusProps;
}) {
  const kpis = data?.kpis ?? null;
  const period = describeRange(filters);

  return (
    <section aria-label="Alert indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="Open Alerts" icon={BellRing} data={kpis} status={status}>
        {({ openAlerts }) => (
          <>
            <KpiValue value={openAlerts} />
            <KpiNote>Not yet resolved · live, date range not applied</KpiNote>
          </>
        )}
      </KpiCard>

      <KpiCard title="Avg. Response Time" icon={Timer} data={kpis} status={status}>
        {({ avgResponseMin, avgResponsePrevMin }) =>
          avgResponseMin === null ? (
            <>
              <KpiValue value="—" />
              <KpiNote>No acknowledged alerts · {period}</KpiNote>
            </>
          ) : (
            <>
              <KpiValue value={avgResponseMin.toFixed(1)} unit="min" />
              <KpiNote>Raised → acknowledged · {period}</KpiNote>
              {avgResponsePrevMin !== null && (
                <ChangeIndicator
                  current={avgResponseMin}
                  previous={avgResponsePrevMin}
                  format={(value) => `${value.toFixed(1)} min`}
                />
              )}
            </>
          )
        }
      </KpiCard>

      <KpiCard title="Resolved Rate" icon={CircleCheckBig} data={kpis} status={status}>
        {({ resolvedRate }) =>
          resolvedRate === null ? (
            <>
              <KpiValue value="—" />
              <KpiNote>No alerts raised · {period}</KpiNote>
            </>
          ) : (
            <>
              <KpiValue value={`${resolvedRate.toFixed(1)}%`} />
              <Progress value={resolvedRate} aria-label={`Resolved rate ${resolvedRate.toFixed(1)}%`} className="my-1" />
              <KpiNote>Of alerts raised · {period}</KpiNote>
            </>
          )
        }
      </KpiCard>

      <KpiCard title="Critical Alerts Today" icon={OctagonAlert} data={kpis} status={status}>
        {({ criticalToday }) => (
          <>
            <KpiValue value={criticalToday} className={cn(criticalToday > 0 && "text-red-700 dark:text-red-400")} />
            <KpiNote>{criticalToday === 0 ? "None since midnight" : "Raised since midnight"}</KpiNote>
          </>
        )}
      </KpiCard>
    </section>
  );
}
