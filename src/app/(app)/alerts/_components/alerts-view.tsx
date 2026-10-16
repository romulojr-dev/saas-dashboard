"use client";

import { useState } from "react";

import type { CardStatusProps } from "@/components/safety/card-states";
import { FilterBar } from "@/components/safety/filter-bar";
import { PageHeader } from "@/components/safety/page-header";
import { usePolledData } from "@/hooks/use-polled-data";
import { useSafetyFilters } from "@/hooks/use-safety-filters";
import { fetchAlertsData } from "@/lib/services/site-safety";
import { AlertDetailSheet } from "./alert-detail-sheet";
import { AlertKpis } from "./alert-kpis";
import { IncidentLog } from "./incident-log";
import { OpenVsResolved } from "./open-vs-resolved";
import { PAGE_SUBTITLE, PAGE_TITLE } from "./page-info";
import { ResponseTrend } from "./response-trend";
import { SeverityDonut } from "./severity-donut";

export function AlertsView() {
  const { filters, filtersKey } = useSafetyFilters();
  // Live page: new alerts and status changes show up within a poll (10 s).
  const { data, isLoading, error, lastUpdated, refetch, refresh } = usePolledData(
    (signal) => fetchAlertsData(filters, signal),
    { key: filtersKey },
  );
  const status: CardStatusProps = { isLoading, error, onRetry: refetch };
  const cardProps = { data, status, filters };

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={PAGE_TITLE}
        subtitle={PAGE_SUBTITLE}
        lastUpdated={lastUpdated}
        hasError={error !== null}
        onRetry={refetch}
      />
      <FilterBar />

      <AlertKpis {...cardProps} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SeverityDonut {...cardProps} />
        <ResponseTrend {...cardProps} />
        <OpenVsResolved {...cardProps} />
      </div>

      <IncidentLog
        {...cardProps}
        onView={(id) => {
          setSelectedId(id);
          setDetailOpen(true);
        }}
      />

      <AlertDetailSheet
        alertId={selectedId}
        log={data?.log ?? []}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onChanged={refresh}
      />
    </div>
  );
}
