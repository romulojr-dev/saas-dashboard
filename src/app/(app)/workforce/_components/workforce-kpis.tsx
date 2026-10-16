import { Activity, Clock, Repeat, Users } from "lucide-react";

import type { CardStatusProps } from "@/components/safety/card-states";
import { ChangeIndicator, KpiCard, KpiNote, KpiValue } from "@/components/safety/kpi-card";
import { describeRange } from "@/lib/safety-filters";
import type { SafetyFilters, WorkforceData } from "@/types";

const hoursFormatter = new Intl.NumberFormat("en-US");

export function WorkforceKpis({
  data,
  filters,
  status,
}: {
  data: WorkforceData | null;
  filters: SafetyFilters;
  status: CardStatusProps;
}) {
  const kpis = data?.kpis ?? null;
  const period = describeRange(filters);

  return (
    <section aria-label="Workforce indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="Total Worker-Hours" icon={Clock} data={kpis} status={status}>
        {({ workerHours }) => (
          <>
            <KpiValue value={hoursFormatter.format(workerHours)} unit="h" />
            <KpiNote>Scheduled, by crew and shift · {period}</KpiNote>
          </>
        )}
      </KpiCard>

      <KpiCard title="Hazard Events / 100 Worker-Hours" icon={Activity} data={kpis} status={status}>
        {({ ratePer100, ratePer100Prev }) =>
          ratePer100 === null ? (
            <>
              <KpiValue value="—" />
              <KpiNote>No scheduled hours · {period}</KpiNote>
            </>
          ) : (
            <>
              <KpiValue value={ratePer100.toFixed(2)} />
              <KpiNote>All hazard events · {period}</KpiNote>
              {ratePer100Prev !== null && (
                <ChangeIndicator current={ratePer100} previous={ratePer100Prev} format={(value) => value.toFixed(2)} />
              )}
            </>
          )
        }
      </KpiCard>

      <KpiCard title="Active Crews / Subcontractors" icon={Users} data={kpis} status={status}>
        {({ activeCrews }) => (
          <>
            <KpiValue value={activeCrews} />
            <KpiNote>With scheduled hours · {period}</KpiNote>
          </>
        )}
      </KpiCard>

      <KpiCard title="Repeat Violators" icon={Repeat} data={kpis} status={status}>
        {({ repeatViolators, repeatThreshold }) => (
          <>
            <KpiValue value={repeatViolators} />
            <KpiNote>
              Workers with {repeatThreshold}+ violations · {period}
            </KpiNote>
          </>
        )}
      </KpiCard>
    </section>
  );
}
