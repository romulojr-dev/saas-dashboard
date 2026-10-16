import { Activity, CalendarCheck, CircleCheck, HardHat, OctagonAlert, Siren, TriangleAlert } from "lucide-react";

import type { CardStatusProps } from "@/components/safety/card-states";
import { ChangeIndicator, KpiCard, KpiValue } from "@/components/safety/kpi-card";
import { cn } from "@/lib/utils";
import type { SiteKpis } from "@/types";

// Green 0, amber 1–3, red 4+. Each level also has its own icon and label.
function alertLevel(count: number) {
  if (count === 0) {
    return { label: "All clear", icon: CircleCheck, className: "text-green-700 dark:text-green-400" };
  }
  if (count <= 3) {
    return { label: "Needs attention", icon: TriangleAlert, className: "text-amber-700 dark:text-amber-400" };
  }
  return { label: "High alert load", icon: OctagonAlert, className: "text-red-700 dark:text-red-400" };
}

export function SafetyKpis({ kpis, status }: { kpis: SiteKpis | null; status: CardStatusProps }) {
  return (
    <section aria-label="Key safety indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard title="Workers on Site" icon={HardHat} data={kpis} status={status}>
        {({ workersOnSite }) => (
          <>
            <KpiValue value={workersOnSite} />
            <p className="text-muted-foreground text-xs">
              {workersOnSite === 0 ? "No workers checked in" : "Checked in via hard-hat GPS"}
            </p>
          </>
        )}
      </KpiCard>

      <KpiCard title="Active Alerts" icon={Siren} data={kpis} status={status}>
        {({ activeAlerts }) => {
          const level = alertLevel(activeAlerts);
          return (
            <>
              <KpiValue value={activeAlerts} className={level.className} />
              <p className={cn("flex items-center gap-1 font-medium text-xs", level.className)}>
                <level.icon className="size-3.5" aria-hidden="true" />
                {level.label}
              </p>
            </>
          );
        }}
      </KpiCard>

      <KpiCard title="Hazard Events Today" icon={Activity} data={kpis} status={status}>
        {({ hazardEventsToday, hazardEventsYesterday }) => (
          <>
            <KpiValue value={hazardEventsToday} />
            <ChangeIndicator current={hazardEventsToday} previous={hazardEventsYesterday} label="vs yesterday" />
          </>
        )}
      </KpiCard>

      <KpiCard title="Days Since Last Incident" icon={CalendarCheck} data={kpis} status={status}>
        {({ daysSinceLastIncident }) => (
          <>
            <KpiValue value={daysSinceLastIncident} />
            <p className="text-muted-foreground text-xs">Recordable incidents on this site</p>
          </>
        )}
      </KpiCard>
    </section>
  );
}
