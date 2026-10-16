import { fetchSiteOverview } from "@/lib/services/site-safety";
import type { SiteOverview } from "@/types";
import { LIVE_POLL_MS, type PolledData, usePolledData } from "./use-polled-data";

export const SITE_OVERVIEW_POLL_MS = LIVE_POLL_MS;

export type SiteOverviewState = PolledData<SiteOverview>;

/** Polls the site overview so worker positions and alerts stay live. */
export function useSiteOverview(intervalMs = SITE_OVERVIEW_POLL_MS): SiteOverviewState {
  return usePolledData(fetchSiteOverview, { intervalMs });
}
