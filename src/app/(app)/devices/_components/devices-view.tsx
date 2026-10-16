"use client";

import type { CardStatusProps } from "@/components/safety/card-states";
import { FilterBar } from "@/components/safety/filter-bar";
import { PageHeader } from "@/components/safety/page-header";
import { usePolledData } from "@/hooks/use-polled-data";
import { useSafetyFilters } from "@/hooks/use-safety-filters";
import { fetchDevicesData } from "@/lib/services/site-safety";
import { BatteryDistribution } from "./battery-distribution";
import { DeviceKpis } from "./device-kpis";
import { DeviceList } from "./device-list";
import { OnlineByHour } from "./online-by-hour";
import { PAGE_SUBTITLE, PAGE_TITLE } from "./page-info";

export function DevicesView() {
  const { filters, filtersKey } = useSafetyFilters();
  // Live page: battery, signal and connectivity change every poll (10 s).
  const { data, isLoading, error, lastUpdated, refetch } = usePolledData(
    (signal) => fetchDevicesData(filters, signal),
    { key: filtersKey },
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

      <DeviceKpis {...cardProps} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OnlineByHour {...cardProps} />
        <BatteryDistribution {...cardProps} />
      </div>

      <DeviceList {...cardProps} />
    </div>
  );
}
