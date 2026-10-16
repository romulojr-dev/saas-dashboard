"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import { SEQUENTIAL_BLUE } from "../chart-palette";
import type { SiteMapLayers } from "./leaflet-map";

// Leaflet touches `window` on import, so the map is client-only.
const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full" />,
});

/**
 * Leaflet site map inside an accessible region. `summary` is read by screen readers
 * in place of the visual map, so it should state what the map shows.
 */
export function SiteMap({ summary, className, ...layers }: SiteMapLayers & { summary: string; className?: string }) {
  return (
    <div
      role="region"
      aria-label={`${summary} Use Tab to reach worker markers and Enter to show details.`}
      className={className ?? "relative isolate min-h-72 flex-1 overflow-hidden rounded-lg ring-1 ring-foreground/10"}
    >
      <LeafletMap {...layers} />
    </div>
  );
}

export function MapLegend({
  showWorkers = true,
  showDensity = false,
  densityTitle = "Density",
}: {
  showWorkers?: boolean;
  showDensity?: boolean;
  densityTitle?: string;
}) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs" aria-label="Map legend">
      {showWorkers && (
        <>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-full border-2 border-white bg-blue-700 shadow" aria-hidden="true" />
            Worker
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="flex size-4 items-center justify-center rounded-full border-2 border-white bg-red-700 font-bold text-[10px] text-white shadow"
              aria-hidden="true"
            >
              !
            </span>
            Worker with active alert
          </li>
        </>
      )}
      <li className="flex items-center gap-1.5">
        <span className="h-3 w-4 rounded-sm border-2 border-red-700 border-dashed bg-red-500/10" aria-hidden="true" />
        Restricted zone
      </li>
      {showDensity && (
        <li className="flex items-center gap-1.5">
          {densityTitle}: low
          <span
            className="h-3 w-16 rounded-sm"
            style={{ background: `linear-gradient(to right, ${SEQUENTIAL_BLUE.slice(2).join(", ")})` }}
            aria-hidden="true"
          />
          high
        </li>
      )}
    </ul>
  );
}
