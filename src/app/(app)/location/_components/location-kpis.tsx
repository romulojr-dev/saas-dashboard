import { HardHat, PersonStanding, ShieldAlert, UserRoundX } from "lucide-react";

import type { CardStatusProps } from "@/components/safety/card-states";
import { KpiCard, KpiNote, KpiValue } from "@/components/safety/kpi-card";
import { describeRange } from "@/lib/safety-filters";
import { cn } from "@/lib/utils";
import type { LocationData, SafetyFilters } from "@/types";

export function LocationKpis({
  data,
  filters,
  status,
}: {
  data: LocationData | null;
  filters: SafetyFilters;
  status: CardStatusProps;
}) {
  const kpis = data?.kpis ?? null;
  const period = describeRange(filters);

  return (
    <section aria-label="Location indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="Workers on Site" icon={HardHat} data={kpis} status={status}>
        {({ workersOnSite }) => (
          <>
            <KpiValue value={workersOnSite} />
            <KpiNote>{workersOnSite === 0 ? "No workers match the filters" : "Live GPS · date range not applied"}</KpiNote>
          </>
        )}
      </KpiCard>

      <KpiCard title="Restricted-Zone Breaches" icon={ShieldAlert} data={kpis} status={status}>
        {({ breaches }) => (
          <>
            <KpiValue value={breaches} />
            <KpiNote>{period}</KpiNote>
          </>
        )}
      </KpiCard>

      <KpiCard title="Lone-Worker Alerts" icon={PersonStanding} data={kpis} status={status}>
        {({ loneWorkerAlerts }) => (
          <>
            <KpiValue value={loneWorkerAlerts} />
            <KpiNote>No co-worker within range · {period}</KpiNote>
          </>
        )}
      </KpiCard>

      <KpiCard title="Man-Down Alerts" icon={UserRoundX} data={kpis} status={status}>
        {({ manDownAlerts, manDownThresholdMin }) => (
          <>
            <KpiValue
              value={manDownAlerts}
              className={cn(manDownAlerts > 0 && "text-red-700 dark:text-red-400")}
            />
            <KpiNote>
              No movement &gt; {manDownThresholdMin} min · {period}
            </KpiNote>
          </>
        )}
      </KpiCard>
    </section>
  );
}
