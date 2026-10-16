"use client";

import type { CardStatusProps } from "@/components/safety/card-states";
import { FilterBar } from "@/components/safety/filter-bar";
import { PageHeader } from "@/components/safety/page-header";
import { usePolledData } from "@/hooks/use-polled-data";
import { useSafetyFilters } from "@/hooks/use-safety-filters";
import { fetchHazardsData } from "@/lib/services/site-safety";
import { ComplianceTrend } from "./compliance-trend";
import { HazardKpis } from "./hazard-kpis";
import { HazardLocationMap } from "./hazard-location-map";
import { HazardPareto } from "./hazard-pareto";
import { HourDayHeatmap } from "./hour-day-heatmap";
import { NearMissTrend } from "./near-miss-trend";
import { PAGE_SUBTITLE, PAGE_TITLE } from "./page-info";
import { PpeViolations } from "./ppe-violations";
import { SnapshotGalleryCard } from "./snapshot-gallery-card";

// New camera detections land throughout the shift; a 30 s refresh keeps the page current
// without the charts redrawing every few seconds.
const POLL_MS = 30_000;

export function HazardsView() {
  const { filters, filtersKey } = useSafetyFilters();
  const { data, isLoading, error, lastUpdated, refetch } = usePolledData(
    (signal) => fetchHazardsData(filters, signal),
    { key: filtersKey, intervalMs: POLL_MS },
  );
  const status: CardStatusProps = { isLoading, error, onRetry: refetch };
  const cardProps = { data, status, filters };

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

      <HazardKpis {...cardProps} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PpeViolations {...cardProps} />
        <ComplianceTrend {...cardProps} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HazardPareto {...cardProps} />
        <NearMissTrend {...cardProps} />
      </div>

      <HourDayHeatmap {...cardProps} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HazardLocationMap {...cardProps} />
        <SnapshotGalleryCard {...cardProps} />
      </div>
    </div>
  );
}
