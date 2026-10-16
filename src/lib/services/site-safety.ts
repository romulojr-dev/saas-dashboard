import {
  acknowledgeMockEvent,
  getMockAlertsData,
  getMockDevicesData,
  getMockFilterOptions,
  getMockHazardsData,
  getMockLocationData,
  getMockSiteOverview,
  getMockWorkforceData,
  resolveMockEvent,
} from "@/lib/mock-data/site-safety";
import type {
  AlertsData,
  DevicesData,
  FilterOptions,
  HazardsData,
  LocationData,
  SafetyEvent,
  SafetyFilters,
  SiteOverview,
  WorkforceData,
} from "@/types";

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

/** Deep copy, so callers get fresh objects like a JSON response (the mock mutates its own state). */
const fresh = <T>(value: T): T => structuredClone(value);

/** Zones and crews for the filter bar. */
export async function fetchFilterOptions(signal?: AbortSignal): Promise<FilterOptions> {
  await simulateRequest(signal);
  return fresh(getMockFilterOptions());
}

/** Site Safety Overview (/dashboard). Polled for live positions and alerts. */
export async function fetchSiteOverview(signal?: AbortSignal): Promise<SiteOverview> {
  const scenario = await simulateRequest(signal);
  const overview = fresh(getMockSiteOverview());
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
  const data = fresh(getMockLocationData(filters));
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
  const data = fresh(getMockHazardsData(filters));
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

/** Alerts & Response (/alerts). Polled so the incident log stays live. */
export async function fetchAlertsData(filters: SafetyFilters, signal?: AbortSignal): Promise<AlertsData> {
  const scenario = await simulateRequest(signal);
  const data = fresh(getMockAlertsData(filters));
  if (scenario === "empty") {
    return {
      ...data,
      kpis: { openAlerts: 0, avgResponseMin: null, avgResponsePrevMin: null, resolvedRate: null, criticalToday: 0 },
      bySeverity: [],
      responseTrend: [],
      openVsResolved: [],
      log: [],
    };
  }
  return data;
}

/** Safety-officer ID of the signed-in user, recorded on acknowledge / resolve. */
export const CURRENT_OFFICER = "SO-01";

/** Acknowledge an open alert. Real API: e.g. POST /api/alerts/{id}/acknowledge */
export async function acknowledgeAlert(id: string): Promise<SafetyEvent> {
  await simulateRequest();
  return fresh(acknowledgeMockEvent(id, CURRENT_OFFICER));
}

/** Resolve an alert. Real API: e.g. POST /api/alerts/{id}/resolve */
export async function resolveAlert(id: string): Promise<SafetyEvent> {
  await simulateRequest();
  return fresh(resolveMockEvent(id, CURRENT_OFFICER));
}

/** Workforce & Trends (/workforce). Historical view, fetched once per filter change. */
export async function fetchWorkforceData(filters: SafetyFilters, signal?: AbortSignal): Promise<WorkforceData> {
  const scenario = await simulateRequest(signal);
  const data = fresh(getMockWorkforceData(filters));
  if (scenario === "empty") {
    return {
      ...data,
      kpis: { ...data.kpis, workerHours: 0, ratePer100: null, ratePer100Prev: null, activeCrews: 0, repeatViolators: 0 },
      weeklyRate: [],
      violationsByCrew: [],
      topViolators: [],
      safetyTrend: { weekly: [], monthly: [] },
    };
  }
  return data;
}

/** Device Health (/devices). Polled so battery, signal and status stay live. */
export async function fetchDevicesData(filters: SafetyFilters, signal?: AbortSignal): Promise<DevicesData> {
  const scenario = await simulateRequest(signal);
  const data = fresh(getMockDevicesData(filters));
  if (scenario === "empty") {
    return {
      ...data,
      kpis: { online: 0, offline: 0, lowBattery: 0, gpsQuality: null, cameraEventsToday: 0 },
      onlineByHour: [],
      batteryBuckets: [],
      devices: [],
    };
  }
  return data;
}
