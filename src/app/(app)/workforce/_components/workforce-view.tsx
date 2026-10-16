"use client";

import type { CardStatusProps } from "@/components/safety/card-states";
import { FilterBar } from "@/components/safety/filter-bar";
import { PageHeader } from "@/components/safety/page-header";
import { usePolledData } from "@/hooks/use-polled-data";
import { useSafetyFilters } from "@/hooks/use-safety-filters";
import { fetchWorkforceData } from "@/lib/services/site-safety";
import { PAGE_SUBTITLE, PAGE_TITLE } from "./page-info";
import { RepeatViolators } from "./repeat-violators";
import { SafetyTrend } from "./safety-trend";
import { ViolationsByCrew } from "./violations-by-crew";
import { WeeklyRateTrend } from "./weekly-rate-trend";
import { WorkforceKpis } from "./workforce-kpis";

export function WorkforceView() {
  const { filters, filtersKey } = useSafetyFilters();
  // Historical view: fetched once per filter change rather than polled.
  const { data, isLoading, error, lastUpdated, refetch } = usePolledData(
    (signal) => fetchWorkforceData(filters, signal),
    { key: filtersKey, intervalMs: null },
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
        live={false}
      />
      <FilterBar />

      <WorkforceKpis {...cardProps} />

      <WeeklyRateTrend {...cardProps} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ViolationsByCrew {...cardProps} />
        <RepeatViolators {...cardProps} />
      </div>

      <SafetyTrend {...cardProps} />
    </div>
  );
}
