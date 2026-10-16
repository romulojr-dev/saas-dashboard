"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { MapContainer, Marker, Polygon, Popup, Rectangle, TileLayer, Tooltip } from "react-leaflet";

import type { DensityCell, Geofence, SiteProject, SiteWorker } from "@/types";
import { sequentialColor } from "../chart-palette";
import { formatClock, formatRelative } from "../format";

// Shared icons (not created per render) so Leaflet doesn't rebuild marker DOM — and drop keyboard focus — on every poll.
// The alert marker adds a "!" glyph so status isn't conveyed by colour alone.
const markerClassName =
  "rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

const workerIcon = L.divIcon({
  className: markerClassName,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
  html: '<span class="block size-full rounded-full border-2 border-white bg-blue-700 shadow-md"></span>',
});

const alertIcon = L.divIcon({
  className: markerClassName,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
  html: '<span class="flex size-full items-center justify-center rounded-full border-2 border-white bg-red-700 font-bold text-sm text-white shadow-md">!</span>',
});

const geofenceStyle: L.PathOptions = {
  color: "#b91c1c",
  weight: 2,
  dashArray: "6 4",
  fillColor: "#ef4444",
  fillOpacity: 0.12,
};

export interface SiteMapLayers {
  project: SiteProject;
  workers: SiteWorker[];
  geofences: Geofence[];
  alertWorkerIds: Set<string>;
  referenceTime: string;
  /** Grid cells for the heat-map layer; drawn only when `showDensity` is true. */
  density?: DensityCell[];
  showDensity?: boolean;
  showWorkers?: boolean;
  /** Tooltip text for a heat-map cell, e.g. "42 GPS fixes". */
  densityLabel?: (count: number) => string;
}

export default function LeafletMap({
  project,
  workers,
  geofences,
  alertWorkerIds,
  referenceTime,
  density = [],
  showDensity = false,
  showWorkers = true,
  densityLabel = (count) => `${count}`,
}: SiteMapLayers) {
  const maxDensity = density.reduce((max, cell) => Math.max(max, cell.count), 0);

  return (
    <MapContainer bounds={project.bounds} scrollWheelZoom={false} className="size-full" maxZoom={19}>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {showDensity &&
        density.map((cell) => (
          <Rectangle
            key={`${cell.bounds[0][0]}:${cell.bounds[0][1]}`}
            bounds={cell.bounds}
            pathOptions={{
              stroke: false,
              fillColor: sequentialColor(cell.count, maxDensity, 2),
              fillOpacity: 0.7,
            }}
          >
            <Tooltip>{densityLabel(cell.count)}</Tooltip>
          </Rectangle>
        ))}

      {geofences.map((fence) => (
        <Polygon key={fence.id} positions={fence.polygon} pathOptions={geofenceStyle}>
          <Tooltip sticky>Restricted zone: {fence.name}</Tooltip>
        </Polygon>
      ))}

      {showWorkers &&
        workers.map((worker) => {
          const hasAlert = alertWorkerIds.has(worker.id);
          return (
            // Keyed on alert status: Leaflet only reads `title` at creation, so remount when it changes.
            <Marker
              key={`${worker.id}-${hasAlert}`}
              position={[worker.lat, worker.lng]}
              icon={hasAlert ? alertIcon : workerIcon}
              title={`Worker ${worker.id}${hasAlert ? " (active alert)" : ""}`}
              zIndexOffset={hasAlert ? 1000 : 0}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">Worker {worker.id}</p>
                  <p className="!my-0">
                    {worker.crew} · {worker.shift} shift
                  </p>
                  <p className="!my-0">
                    Last seen <time dateTime={worker.lastSeen}>{formatClock(worker.lastSeen, true)}</time> (
                    {formatRelative(worker.lastSeen, referenceTime)})
                  </p>
                  {hasAlert && <p className="!my-0 font-medium text-red-700">⚠ Has an active alert</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}
