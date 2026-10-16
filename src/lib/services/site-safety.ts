import {
  getMockFilterOptions,
  getMockHazardsData,
  getMockLocationData,
  getMockSiteOverview,
} from "@/lib/mock-data/site-safety";
import type { FilterOptions, HazardsData, LocationData, SafetyFilters, SiteOverview } from "@/types";

/*
 * Single data-access layer for the Site Safety pages. UI components only ever see the
 * types returned here, so swapping the mock for the real IoT API means replacing the
 * body of each exported function, e.g.:
 *
 *   const res = await fetch(`/api/sites/riverside-c/location?${serializeFilters(filters)}`, { cache: "no-store", signal });
 *   if (!res.ok) throw new Error(`Failed to load location data (${res.status})`);
 *   return (await res.json()) as LocationData;
 */

type MockScenario = "error" | "empty" | null;

/**
 * Simulated network round-trip. Dev-only: append ?mock=error or ?mock=empty
 * to any page URL to preview its error / empty card states.
 */
async function simulateRequest(signal?: AbortSignal): Promise<MockScenario> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const scenario = new URLSearchParams(window.location.search).get("mock");
  if (scenario === "error") throw new Error("Could not reach the site telemetry service.");
  return scenario === "empty" ? "empty" : null;
}

/** Zones and crews for the filter bar. */
export async function fetchFilterOptions(signal?: AbortSignal): Promise<FilterOptions> {
  await simulateRequest(signal);
  return getMockFilterOptions();
}

/** Site Safety Overview (/dashboard). Polled for live positions and alerts. */
export async function fetchSiteOverview(signal?: AbortSignal): Promise<SiteOverview> {
  const scenario = await simulateRequest(signal);
  const overview = getMockSiteOverview();
  if (scenario === "empty") {
    return {
      ...overview,
      kpis: { ...overview.kpis, workersOnSite: 0, activeAlerts: 0, hazardEventsToday: 0 },
      workers: [],
      alerts: [],
      snapshots: [],
      hazardRateTrend: [],
    };
  }
  return overview;
}

/** Location & Movement (/location). Polled for live positions. */
export async function fetchLocationData(filters: SafetyFilters, signal?: AbortSignal): Promise<LocationData> {
  const scenario = await simulateRequest(signal);
  const data = getMockLocationData(filters);
  if (scenario === "empty") {
    return {
      ...data,
      kpis: { ...data.kpis, workersOnSite: 0, breaches: 0, loneWorkerAlerts: 0, manDownAlerts: 0 },
      workers: [],
      alertWorkerIds: [],
      density: [],
      workersByZone: [],
      breachesByZone: [],
      highRiskTime: [],
      breachLog: [],
      drills: [],
    };
  }
  return data;
}

/** Hazard Detection (/hazards). Camera-detected PPE violations, hazards and near-misses. */
export async function fetchHazardsData(filters: SafetyFilters, signal?: AbortSignal): Promise<HazardsData> {
  const scenario = await simulateRequest(signal);
  const data = getMockHazardsData(filters);
  if (scenario === "empty") {
    return {
      ...data,
      kpis: {
        hazardEvents: 0,
        hazardEventsPrev: 0,
        ppeCompliance: null,
        ppeCompliancePrev: null,
        nearMisses: 0,
        nearMissesPrev: 0,
        topHazard: null,
      },
      ppeByPeriod: [],
      complianceTrend: [],
      pareto: [],
      nearMissTrend: [],
      hourDay: [],
      locationDensity: [],
      snapshots: [],
    };
  }
  return data;
}
