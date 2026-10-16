"use client";

import type { CardStatusProps } from "@/components/safety/card-states";
import { FilterBar } from "@/components/safety/filter-bar";
import { PageHeader } from "@/components/safety/page-header";
import { usePolledData } from "@/hooks/use-polled-data";
import { useSafetyFilters } from "@/hooks/use-safety-filters";
import { fetchLocationData } from "@/lib/services/site-safety";
import { BreachLog } from "./breach-log";
import { BreachesByZone } from "./breaches-by-zone";
import { DrillTrend } from "./drill-trend";
import { HighRiskTime } from "./high-risk-time";
import { LiveMapCard } from "./live-map-card";
import { LocationKpis } from "./location-kpis";
import { PAGE_SUBTITLE, PAGE_TITLE } from "./page-info";
import { WorkersByZone } from "./workers-by-zone";

export function LocationView() {
  const { filters, filtersKey } = useSafetyFilters();
  // Live page: polls so positions and counts stay current; a filter change refetches.
  const { data, isLoading, error, lastUpdated, refetch } = usePolledData(
    (signal) => fetchLocationData(filters, signal),
    { key: filtersKey },
  );
  const status: CardStatusProps = { isLoading, error, onRetry: refetch };

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

      <LocationKpis data={data} filters={filters} status={status} />

      <div className="grid grid-cols-1 gap-4 lg:h-[500px] lg:grid-cols-20">
        <LiveMapCard data={data} status={status} filters={filters} className="h-[460px] lg:col-span-13 lg:h-full" />
        <WorkersByZone data={data} status={status} className="lg:col-span-7" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BreachesByZone data={data} status={status} filters={filters} />
        <HighRiskTime data={data} status={status} filters={filters} />
      </div>

      <BreachLog data={data} status={status} filters={filters} />

      <DrillTrend data={data} status={status} filters={filters} />
    </div>
  );
}
