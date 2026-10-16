"use client";

import { useSiteOverview } from "@/hooks/use-site-overview";
import type { CardStatusProps } from "@/components/safety/card-states";
import { PageHeader } from "@/components/safety/page-header";
import { ActiveAlerts } from "./active-alerts";
import { FlaggedSnapshots } from "./flagged-snapshots";
import { HazardRateTrend } from "./hazard-rate-trend";
import { SafetyKpis } from "./safety-kpis";
import { SiteMap } from "./site-map";

export function SiteSafetyOverview() {
  const { data, isLoading, error, lastUpdated, refetch } = useSiteOverview();
  const status: CardStatusProps = { isLoading, error, onRetry: refetch };

  return (
    <div className="flex flex-col gap-4">
      {/* [1] + [2] */}
      <PageHeader
        title="Site Safety Overview"
        subtitle={
          data ? (
            <>
              <span className="font-medium text-foreground">{data.project.name}</span>
              <span aria-hidden="true"> · </span>
              {data.project.location}
            </>
          ) : (
            !error && <span className="inline-block h-4 w-80 animate-pulse rounded-md bg-muted align-middle" />
          )
        }
        lastUpdated={lastUpdated}
        hasError={error !== null}
        onRetry={refetch}
      />

      {/* [3]–[6] */}
      <SafetyKpis kpis={data?.kpis ?? null} status={status} />

      {/* [7] 60% / [8] 40%, same height */}
      <div className="grid grid-cols-1 gap-4 lg:h-[520px] lg:grid-cols-5">
        <SiteMap data={data} status={status} className="h-[440px] lg:col-span-3 lg:h-full" />
        <ActiveAlerts
          alerts={data?.alerts ?? null}
          referenceTime={data?.generatedAt ?? null}
          status={status}
          className="h-[440px] lg:col-span-2 lg:h-full"
        />
      </div>

      {/* [9] 35% / [10] 65% */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-20">
        <FlaggedSnapshots snapshots={data?.snapshots ?? null} status={status} className="lg:col-span-7" />
        <HazardRateTrend trend={data?.hazardRateTrend ?? null} status={status} className="lg:col-span-13" />
      </div>
    </div>
  );
}
