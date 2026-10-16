import { ListOrdered, ScanEye, ShieldCheck, Truck } from "lucide-react";

import type { CardStatusProps } from "@/components/safety/card-states";
import { PercentGauge } from "@/components/safety/charts/gauge";
import { ChangeIndicator, KpiCard, KpiNote, KpiValue } from "@/components/safety/kpi-card";
import { describeRange } from "@/lib/safety-filters";
import type { HazardsData, SafetyFilters } from "@/types";

export function HazardKpis({
  data,
  filters,
  status,
}: {
  data: HazardsData | null;
  filters: SafetyFilters;
  status: CardStatusProps;
}) {
  const kpis = data?.kpis ?? null;
  const period = describeRange(filters);

  return (
    <section aria-label="Hazard indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="Hazard Events" icon={ScanEye} data={kpis} status={status}>
        {({ hazardEvents, hazardEventsPrev }) => (
          <>
            <KpiValue value={hazardEvents} />
            <KpiNote>Camera-detected · {period}</KpiNote>
            {hazardEventsPrev !== null && <ChangeIndicator current={hazardEvents} previous={hazardEventsPrev} />}
          </>
        )}
      </KpiCard>

      <KpiCard title="PPE Compliance" icon={ShieldCheck} data={data} status={status}>
        {({ kpis: { ppeCompliance, ppeCompliancePrev }, complianceTarget }) =>
          ppeCompliance === null ? (
            <>
              <KpiValue value="—" />
              <KpiNote>No scheduled shifts in this period</KpiNote>
            </>
          ) : (
            <>
              <PercentGauge value={ppeCompliance} target={complianceTarget} label="PPE compliance" />
              <KpiNote>Worker-shifts with no PPE violation</KpiNote>
              {ppeCompliancePrev !== null && (
                <ChangeIndicator
                  current={ppeCompliance}
                  previous={ppeCompliancePrev}
                  goodDirection="up"
                  format={(value) => `${value.toFixed(1)} pts`}
                />
              )}
            </>
          )
        }
      </KpiCard>

      <KpiCard title="Machinery Near-Misses" icon={Truck} data={kpis} status={status}>
        {({ nearMisses, nearMissesPrev }) => (
          <>
            <KpiValue value={nearMisses} />
            <KpiNote>{period}</KpiNote>
            {nearMissesPrev !== null && <ChangeIndicator current={nearMisses} previous={nearMissesPrev} />}
          </>
        )}
      </KpiCard>

      <KpiCard title="Most Common Hazard" icon={ListOrdered} data={kpis} status={status}>
        {({ topHazard }) =>
          topHazard ? (
            <>
              <p className="font-heading text-2xl leading-tight tracking-tight">{topHazard.type}</p>
              <KpiNote>
                {topHazard.count} detections · {topHazard.share}% of site hazards · {period}
              </KpiNote>
            </>
          ) : (
            <>
              <p className="font-heading text-2xl leading-tight tracking-tight">None</p>
              <KpiNote>No site hazards detected · {period}</KpiNote>
            </>
          )
        }
      </KpiCard>
    </section>
  );
}
