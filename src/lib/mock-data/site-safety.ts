import { resolveDateRange } from "@/lib/safety-filters";
import type {
  AlertSeverity,
  BucketGranularity,
  CountBucket,
  CountByKey,
  Crew,
  DensityCell,
  DrillResult,
  EventCategory,
  FilterOptions,
  Geofence,
  HazardSnapshot,
  HazardsData,
  HazardType,
  HourDayCell,
  LocationData,
  ParetoRow,
  PpeBucket,
  RateBucket,
  SafetyEvent,
  SafetyFilters,
  Shift,
  SiteOverview,
  SiteProject,
  SiteWorker,
  SiteZone,
  WeeklyHazardRate,
  WorkerZoneTime,
} from "@/types";

/*
 * In-memory simulation of the site: a seeded 12-week event history plus live ticks.
 * Every page reads from the same state, so numbers agree across the dashboard.
 * Faker is avoided because this module ships in the client bundle.
 */

// ---------------------------------------------------------------------------
// Seeded randomness
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(42);
const between = (min: number, max: number) => min + random() * (max - min);
const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)];

function pickWeighted<T>(items: readonly (readonly [T, number])[]): T {
  const total = items.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;
  for (const [item, weight] of items) {
    roll -= weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1][0];
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// ---------------------------------------------------------------------------
// Reference data: project, zones, crews, workers
// ---------------------------------------------------------------------------

export const siteProject: SiteProject = {
  name: "Riverside Commons — Building C",
  location: "1450 NE Riverside Pkwy, Portland, OR",
  center: [45.5302, -122.6655],
  bounds: [
    [45.5293, -122.6672],
    [45.5311, -122.6638],
  ],
};

function circlePolygon(lat: number, lng: number, radiusMeters: number, points = 20): [number, number][] {
  const dLat = radiusMeters / 111_320;
  const dLng = radiusMeters / (111_320 * Math.cos((lat * Math.PI) / 180));
  return Array.from({ length: points }, (_, i) => {
    const angle = (i / points) * 2 * Math.PI;
    return [lat + dLat * Math.sin(angle), lng + dLng * Math.cos(angle)];
  });
}

export const geofences: Geofence[] = [
  {
    id: "crane-swing",
    name: "Crane Swing Radius",
    polygon: circlePolygon(45.53045, -122.66505, 24),
  },
  {
    id: "excavation-pit",
    name: "Excavation Pit",
    polygon: [
      [45.5296, -122.6647],
      [45.53, -122.6647],
      [45.53, -122.66405],
      [45.5296, -122.66405],
    ],
  },
  {
    id: "scaffold-drop-b",
    name: "Scaffold Drop Zone B",
    polygon: [
      [45.53075, -122.6668],
      [45.53093, -122.6668],
      [45.53093, -122.6659],
      [45.53075, -122.6659],
    ],
  },
  {
    id: "hazmat-store",
    name: "Fuel & Hazmat Store",
    polygon: [
      [45.52942, -122.66705],
      [45.52962, -122.66705],
      [45.52962, -122.66672],
      [45.52942, -122.66672],
    ],
  },
];

const workAreas = [
  { id: "level-4-slab", name: "Level 4 Slab", center: [45.5302, -122.666] },
  { id: "tower-core", name: "Tower Core", center: [45.5305, -122.6657] },
  { id: "east-excavation", name: "East Excavation", center: [45.53022, -122.6643] },
  { id: "north-facade", name: "North Facade", center: [45.53058, -122.6664] },
  { id: "level-2-services", name: "Level 2 Services", center: [45.53, -122.6655] },
  { id: "south-laydown", name: "South Laydown Yard", center: [45.52955, -122.6662] },
] as const satisfies readonly { id: string; name: string; center: readonly [number, number] }[];

type WorkAreaId = (typeof workAreas)[number]["id"];

export const siteZones: SiteZone[] = [
  ...workAreas.map((area): SiteZone => ({ id: area.id, name: area.name, kind: "Work area" })),
  ...geofences.map((fence): SiteZone => ({ id: fence.id, name: fence.name, kind: "Restricted" })),
];

const zoneNames = new Map(siteZones.map((zone) => [zone.id, zone.name]));
const workAreaById = new Map(workAreas.map((area) => [area.id, area]));

interface CrewProfile extends Crew {
  homeZoneId: WorkAreaId;
  nearbyRestrictedZoneId: string;
  riskFactor: number; // relative hazard-event rate
}

const crewProfiles: CrewProfile[] = [
  { id: "concrete", name: "Concrete", subcontractor: "Cascade Formworks LLC", homeZoneId: "level-4-slab", nearbyRestrictedZoneId: "crane-swing", riskFactor: 1 },
  { id: "steel", name: "Steel Erection", subcontractor: "Apex Steel Inc.", homeZoneId: "tower-core", nearbyRestrictedZoneId: "crane-swing", riskFactor: 1.5 },
  { id: "excavation", name: "Excavation", subcontractor: "Northgate Earthworks", homeZoneId: "east-excavation", nearbyRestrictedZoneId: "excavation-pit", riskFactor: 1.2 },
  { id: "scaffolding", name: "Scaffolding", subcontractor: "SkyRise Access Co.", homeZoneId: "north-facade", nearbyRestrictedZoneId: "scaffold-drop-b", riskFactor: 1.4 },
  { id: "electrical", name: "Electrical", subcontractor: "Voltline Electric", homeZoneId: "level-2-services", nearbyRestrictedZoneId: "hazmat-store", riskFactor: 0.7 },
  { id: "logistics", name: "Logistics", subcontractor: "Riverside Site Services", homeZoneId: "south-laydown", nearbyRestrictedZoneId: "hazmat-store", riskFactor: 0.9 },
];

export const siteCrews: Crew[] = crewProfiles.map(({ id, name, subcontractor }) => ({ id, name, subcontractor }));
const crewById = new Map(crewProfiles.map((crew) => [crew.id, crew]));

// [worker ID, crew ID, shift, personal risk factor]. A few workers repeat violations more often.
const workerRoster: [string, string, Shift, number][] = [
  ["W-003", "concrete", "Day", 1],
  ["W-007", "concrete", "Day", 1],
  ["W-011", "concrete", "Day", 2.4],
  ["W-014", "concrete", "Night", 1.2],
  ["W-018", "steel", "Day", 1],
  ["W-021", "steel", "Day", 2.8],
  ["W-022", "steel", "Day", 0.8],
  ["W-026", "steel", "Night", 1],
  ["W-030", "excavation", "Day", 1.1],
  ["W-031", "excavation", "Day", 0.9],
  ["W-035", "excavation", "Night", 1],
  ["W-038", "excavation", "Day", 2.1],
  ["W-041", "scaffolding", "Day", 1.3],
  ["W-044", "scaffolding", "Day", 2.6],
  ["W-047", "scaffolding", "Day", 0.9],
  ["W-052", "electrical", "Day", 0.8],
  ["W-053", "electrical", "Night", 1],
  ["W-058", "electrical", "Day", 0.7],
  ["W-061", "electrical", "Day", 1.9],
  ["W-064", "logistics", "Night", 1],
  ["W-067", "logistics", "Day", 0.9],
  ["W-070", "logistics", "Night", 1.1],
  ["W-073", "logistics", "Day", 1],
  ["W-076", "steel", "Day", 1.2],
];

const SHIFT_HOURS: Record<Shift, number[]> = {
  Day: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16], // 07:00–17:00
  Night: [19, 20, 21, 22, 23, 0, 1, 2, 3, 4], // 19:00–05:00
};

export function shiftAt(time: number): Shift {
  const hour = new Date(time).getHours();
  return hour >= 6 && hour < 18 ? "Day" : "Night";
}

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

interface TypeProfile {
  category: EventCategory;
  severities: readonly AlertSeverity[];
  weight: number; // relative frequency within all events
}

const typeProfiles: Record<HazardType, TypeProfile> = {
  "No Hi-Vis Vest": { category: "PPE", severities: ["Medium", "Low"], weight: 14 },
  "No Gloves": { category: "PPE", severities: ["Low", "Medium"], weight: 10 },
  "No Hard Hat": { category: "PPE", severities: ["High", "Medium"], weight: 9 },
  "No Harness at Height": { category: "PPE", severities: ["Critical", "High"], weight: 7 },
  "Trip Hazard": { category: "Hazard", severities: ["Low", "Medium"], weight: 7 },
  "Poor Housekeeping": { category: "Hazard", severities: ["Low"], weight: 6 },
  "Open Edge": { category: "Hazard", severities: ["High", "Critical"], weight: 5 },
  "Unguarded Opening": { category: "Hazard", severities: ["High", "Medium"], weight: 3 },
  "Falling Object": { category: "Hazard", severities: ["Critical", "High"], weight: 2 },
  "Fire/Smoke": { category: "Hazard", severities: ["Critical", "High"], weight: 1 },
  "Machinery Near-Miss": { category: "Near-miss", severities: ["High", "Critical", "Medium"], weight: 10 },
  "Restricted Zone Entry": { category: "Zone breach", severities: ["High", "Medium", "Critical"], weight: 16 },
  "Lone Worker": { category: "Lone worker", severities: ["Medium", "Low"], weight: 6 },
  "Man-Down": { category: "Man-down", severities: ["Critical"], weight: 4 },
};

const weightedTypes = Object.entries(typeProfiles).map(([type, profile]) => [type as HazardType, profile.weight] as const);
const cameraTypes = (Object.keys(typeProfiles) as HazardType[]).filter((type) =>
  ["PPE", "Hazard", "Near-miss"].includes(typeProfiles[type].category),
);

// Placeholder frames in /public/snapshots; GPS-raised events have no image.
const snapshotImages: Partial<Record<HazardType, string>> = {
  "No Hard Hat": "/snapshots/no-hard-hat.svg",
  "No Hi-Vis Vest": "/snapshots/no-hi-vis.svg",
  "No Harness at Height": "/snapshots/no-harness.svg",
  "No Gloves": "/snapshots/no-gloves.svg",
  "Open Edge": "/snapshots/open-edge.svg",
  "Unguarded Opening": "/snapshots/unguarded-opening.svg",
  "Trip Hazard": "/snapshots/trip-hazard.svg",
  "Fire/Smoke": "/snapshots/fire-smoke.svg",
  "Falling Object": "/snapshots/falling-object.svg",
  "Poor Housekeeping": "/snapshots/poor-housekeeping.svg",
  "Machinery Near-Miss": "/snapshots/machinery-near-miss.svg",
};

export const safetyOfficers = ["SO-01", "SO-02", "SO-03", "SO-04"];
export const MAN_DOWN_THRESHOLD_MIN = 5;
const LAST_INCIDENT = new Date("2026-08-27T14:30:00Z").getTime();
const HISTORY_DAYS = 84; // 12 weeks

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

function isInsidePolygon(lat: number, lng: number, polygon: [number, number][]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];
    if (lngI > lng !== lngJ > lng && lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI) {
      inside = !inside;
    }
  }
  return inside;
}

export function findGeofence(lat: number, lng: number): Geofence | undefined {
  return geofences.find((fence) => isInsidePolygon(lat, lng, fence.polygon));
}

function clampToSite(lat: number, lng: number): [number, number] {
  const [[south, west], [north, east]] = siteProject.bounds;
  return [Math.min(north, Math.max(south, lat)), Math.min(east, Math.max(west, lng))];
}

function zoneIdAt(lat: number, lng: number, crewId: string) {
  return findGeofence(lat, lng)?.id ?? crewById.get(crewId)?.homeZoneId ?? workAreas[0].id;
}

function positionNear(zoneId: WorkAreaId, spreadLat = 0.00012, spreadLng = 0.00018) {
  const [lat, lng] = workAreaById.get(zoneId)!.center;
  return clampToSite(lat + between(-spreadLat, spreadLat), lng + between(-spreadLng, spreadLng));
}

/** A random point near the middle of a geofence (centroid ± 30% of its extent). */
function pointInsideFence(fenceId: string): [number, number] {
  const { polygon } = geofences.find((fence) => fence.id === fenceId)!;
  const lats = polygon.map(([lat]) => lat);
  const lngs = polygon.map(([, lng]) => lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const jitter = (min: number, max: number) => (min + max) / 2 + between(-0.3, 0.3) * (max - min);
  return [jitter(minLat, maxLat), jitter(minLng, maxLng)];
}

// ---------------------------------------------------------------------------
// Simulation state
// ---------------------------------------------------------------------------

interface PositionSample {
  time: number;
  crewId: string;
  shift: Shift;
  zoneId: string;
  lat: number;
  lng: number;
}

interface SimulationState {
  workers: SiteWorker[];
  events: SafetyEvent[]; // oldest first
  positionSamples: PositionSample[];
  drills: (DrillResult & { byCrew: Record<string, number> })[];
  nextEventId: number;
  lastTick: number;
  historyStart: number; // earliest time the event log covers
}

const TICK_MS = 10 * SECOND;
let state: SimulationState | null = null;

function startOfDay(time: number) {
  const d = new Date(time);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfWeek(time: number) {
  const d = new Date(startOfDay(time));
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

/** Scheduled worker-hours for one worker on a given day (Sunday off, Saturday half day). */
function shiftHoursOn(dayStart: number) {
  const weekday = new Date(dayStart).getDay();
  if (weekday === 0) return 0;
  return weekday === 6 ? 5 : SHIFT_HOURS.Day.length;
}

function makeEvent(
  id: number,
  worker: SiteWorker,
  type: HazardType,
  occurredAt: number,
  zoneId: string,
  [lat, lng]: [number, number],
): SafetyEvent {
  const profile = typeProfiles[type];
  const durationSec =
    profile.category === "Zone breach"
      ? Math.round(between(30, 15 * 60))
      : profile.category === "Man-down"
        ? Math.round(between(MAN_DOWN_THRESHOLD_MIN * 60, 20 * 60))
        : null;
  return {
    id: `AL-${id}`,
    severity: zoneId === "crane-swing" && profile.category === "Zone breach" ? "Critical" : pick(profile.severities),
    type,
    category: profile.category,
    workerId: worker.id,
    crewId: worker.crewId,
    shift: shiftAt(occurredAt),
    zoneId,
    zone: zoneNames.get(zoneId) ?? zoneId,
    createdAt: new Date(occurredAt).toISOString(),
    status: "Open",
    acknowledgedAt: null,
    resolvedAt: null,
    assignedTo: null,
    durationSec,
    snapshotUrl: snapshotImages[type] ?? null,
    lat,
    lng,
  };
}

/** A plausible spot inside a zone: within the fence for restricted zones, around the work area otherwise. */
function positionInZone(zoneId: string): [number, number] {
  return workAreaById.has(zoneId as WorkAreaId)
    ? positionNear(zoneId as WorkAreaId, 0.00028, 0.0004)
    : pointInsideFence(zoneId);
}

function eventZone(worker: SiteWorker, type: HazardType) {
  const crew = crewById.get(worker.crewId)!;
  if (typeProfiles[type].category === "Zone breach") {
    return random() < 0.7 ? crew.nearbyRestrictedZoneId : pick(geofences).id;
  }
  return random() < 0.8 ? crew.homeZoneId : pick(workAreas).id;
}

/** Response times improve over the 12 weeks; critical alerts are answered faster. */
function settle(event: SafetyEvent, now: number, ageWeeks: number) {
  const occurred = new Date(event.createdAt).getTime();
  const urgency = event.severity === "Critical" ? 0.5 : event.severity === "High" ? 0.8 : 1.2;
  const ackDelay = between(1.5, 9) * urgency * (0.7 + ageWeeks * 0.05) * MINUTE;
  const resolveDelay = between(8, 80) * MINUTE;
  const ackAt = occurred + ackDelay;
  const resolveAt = ackAt + resolveDelay;
  if (ackAt > now) return;
  event.status = "Acknowledged";
  event.acknowledgedAt = new Date(ackAt).toISOString();
  event.assignedTo = pick(safetyOfficers);
  if (resolveAt > now) return;
  event.status = "Resolved";
  event.resolvedAt = new Date(resolveAt).toISOString();
}

function createInitialState(now: number): SimulationState {
  const workers: SiteWorker[] = workerRoster.map(([id, crewId, shift]) => {
    const crew = crewById.get(crewId)!;
    const [lat, lng] = positionNear(crew.homeZoneId);
    return { id, crewId, crew: crew.name, shift, lat, lng, lastSeen: new Date(now - between(2, 25) * SECOND).toISOString() };
  });
  const riskByWorker = new Map(workerRoster.map(([id, , , risk]) => [id, risk]));

  const events: SafetyEvent[] = [];
  const positionSamples: PositionSample[] = [];
  const firstDay = startOfDay(now) - (HISTORY_DAYS - 1) * DAY;

  for (let day = firstDay; day <= now; day += DAY) {
    const hoursToday = shiftHoursOn(day);
    if (hoursToday === 0) continue;
    const ageWeeks = (now - day) / (7 * DAY);
    const trend = 0.75 + ageWeeks * 0.045; // hazard rate drifts down over time

    for (const worker of workers) {
      const crew = crewById.get(worker.crewId)!;
      const hours = SHIFT_HOURS[worker.shift].slice(0, hoursToday);
      for (const hour of hours) {
        // Night shift hours after midnight belong to the next calendar day.
        const hourStart = day + (hour < 12 && worker.shift === "Night" ? DAY : 0) + hour * HOUR;
        if (hourStart > now) continue;

        // Hourly GPS sample for the density heat map (~8% of time spent in a restricted zone).
        const [lat, lng] =
          random() < 0.08 ? pointInsideFence(crew.nearbyRestrictedZoneId) : positionNear(crew.homeZoneId, 0.00028, 0.0004);
        positionSamples.push({
          time: hourStart,
          crewId: worker.crewId,
          shift: worker.shift,
          zoneId: zoneIdAt(lat, lng, worker.crewId),
          lat,
          lng,
        });

        const rate = 0.024 * trend * crew.riskFactor * (riskByWorker.get(worker.id) ?? 1);
        if (random() < rate) {
          const occurredAt = hourStart + between(0, HOUR);
          if (occurredAt > now) continue;
          const type = pickWeighted(weightedTypes);
          const zoneId = eventZone(worker, type);
          const event = makeEvent(0, worker, type, occurredAt, zoneId, positionInZone(zoneId));
          settle(event, now, ageWeeks);
          events.push(event);
        }
      }
    }
  }

  events.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  events.forEach((event, i) => {
    event.id = `AL-${1001 + i}`;
  });

  const drillBase = [7.8, 7.1, 6.9, 6.2, 5.6];
  const drills = [100, 79, 58, 37, 16].map((daysAgo, i) => {
    const date = startOfDay(now - daysAgo * DAY) + 10 * HOUR;
    const byCrew = Object.fromEntries(
      crewProfiles.map((crew) => [crew.id, Math.round((drillBase[i] - between(0, 1.6)) * 10) / 10]),
    );
    // The slowest crew sets the overall muster time.
    byCrew[pick(crewProfiles).id] = drillBase[i];
    return { id: `DR-${i + 1}`, date: new Date(date).toISOString(), musterMinutes: drillBase[i], byCrew };
  });

  return {
    workers,
    events,
    positionSamples,
    drills,
    nextEventId: 1001 + events.length,
    lastTick: now,
    historyStart: firstDay,
  };
}

/** One live tick: workers move, new events arrive, open events get handled. */
function tick(current: SimulationState, now: number) {
  current.workers = current.workers.map((worker) => {
    // ~4% chance per tick that a helmet misses a GPS fix (e.g., inside the core).
    if (random() < 0.04) return worker;
    // Random walk with a gentle pull back toward the crew's work area.
    const [homeLat, homeLng] = workAreaById.get(crewById.get(worker.crewId)!.homeZoneId)!.center;
    const [lat, lng] = clampToSite(
      worker.lat + (homeLat - worker.lat) * 0.03 + between(-0.00003, 0.00003),
      worker.lng + (homeLng - worker.lng) * 0.03 + between(-0.00004, 0.00004),
    );
    return { ...worker, lat, lng, lastSeen: new Date(now - between(1, 8) * SECOND).toISOString() };
  });

  const open = current.events.filter((event) => event.status !== "Resolved");

  // Workers inside a geofence trigger a zone-entry alert (once per open alert).
  const intruder = current.workers.find(
    (worker) =>
      findGeofence(worker.lat, worker.lng) &&
      !open.some((event) => event.workerId === worker.id && event.type === "Restricted Zone Entry"),
  );
  if (intruder && random() < 0.3) {
    const zoneId = findGeofence(intruder.lat, intruder.lng)!.id;
    current.events.push(
      makeEvent(current.nextEventId++, intruder, "Restricted Zone Entry", now, zoneId, [intruder.lat, intruder.lng]),
    );
  } else if (random() < 0.05) {
    const worker = pick(current.workers);
    const type = pick(cameraTypes);
    const position: [number, number] = [worker.lat, worker.lng];
    current.events.push(makeEvent(current.nextEventId++, worker, type, now, zoneIdAt(...position, worker.crewId), position));
  }

  // Safety officers work the queue, oldest first.
  const oldestOpen = open.find((event) => event.status === "Open");
  if (oldestOpen && random() < 0.12) acknowledge(oldestOpen, now);
  const oldestAcknowledged = open.find((event) => event.status === "Acknowledged");
  if (oldestAcknowledged && random() < 0.12) resolve(oldestAcknowledged, now);
}

function acknowledge(event: SafetyEvent, now: number, officer = pick(safetyOfficers)) {
  event.status = "Acknowledged";
  event.acknowledgedAt = new Date(now).toISOString();
  event.assignedTo = officer;
}

function resolve(event: SafetyEvent, now: number) {
  if (!event.acknowledgedAt) acknowledge(event, now);
  event.status = "Resolved";
  event.resolvedAt = new Date(now).toISOString();
}

/** Returns the simulation, advancing it by however many 10-second ticks have elapsed. */
function getState(now: number): SimulationState {
  if (!state) {
    state = createInitialState(now);
    return state;
  }
  const ticks = Math.min(30, Math.floor((now - state.lastTick) / TICK_MS));
  for (let i = 0; i < ticks; i++) tick(state, now);
  if (ticks > 0) state.lastTick = now;
  return state;
}

// ---------------------------------------------------------------------------
// Filtering & aggregation helpers
// ---------------------------------------------------------------------------

interface TimeWindow {
  start: number;
  end: number;
}

/** Events matching the filters, inside the filter's date range (or an explicit window). */
function filterEvents(
  events: SafetyEvent[],
  filters: SafetyFilters,
  now: number,
  { start, end }: TimeWindow = resolveDateRange(filters, now),
) {
  return events.filter((event) => {
    const time = new Date(event.createdAt).getTime();
    return (
      time >= start &&
      time < end + 1 &&
      (!filters.zone || event.zoneId === filters.zone) &&
      (!filters.crew || event.crewId === filters.crew) &&
      (!filters.shift || event.shift === filters.shift)
    );
  });
}

function currentZoneId(worker: SiteWorker) {
  return zoneIdAt(worker.lat, worker.lng, worker.crewId);
}

/** Live workers matching the zone / crew / shift filters (the date range doesn't apply to "now"). */
function filterWorkers(workers: SiteWorker[], filters: SafetyFilters) {
  return workers.filter(
    (worker) =>
      (!filters.zone || currentZoneId(worker) === filters.zone) &&
      (!filters.crew || worker.crewId === filters.crew) &&
      (!filters.shift || worker.shift === filters.shift),
  );
}

function countBy<T>(items: T[], keyOf: (item: T) => string, labelOf: (key: string) => string): CountByKey[] {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(keyOf(item), (counts.get(keyOf(item)) ?? 0) + 1);
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: labelOf(key), count }))
    .sort((a, b) => b.count - a.count);
}

const zoneLabel = (id: string) => zoneNames.get(id) ?? id;

function newestFirst(events: SafetyEvent[]) {
  return [...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Weekly hazard events per 100 scheduled worker-hours, oldest week first. */
function weeklyHazardRates(events: SafetyEvent[], workers: SiteWorker[], now: number, weeks = 12): WeeklyHazardRate[] {
  const thisWeek = startOfWeek(now);
  return Array.from({ length: weeks }, (_, i) => {
    const weekStart = thisWeek - (weeks - 1 - i) * 7 * DAY;
    const weekEnd = Math.min(weekStart + 7 * DAY, now);
    const workerHours = workerHoursIn({ start: weekStart, end: weekEnd }, workers);
    const count = events.filter((event) => {
      const time = new Date(event.createdAt).getTime();
      return time >= weekStart && time < weekEnd;
    }).length;
    return {
      weekStart: new Date(weekStart).toISOString(),
      ratePer100WorkerHours: workerHours > 0 ? Math.round((count / workerHours) * 10000) / 100 : 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Page payloads (called only from src/lib/services/site-safety.ts)
// ---------------------------------------------------------------------------

export function getMockFilterOptions(): FilterOptions {
  return { zones: siteZones, crews: siteCrews };
}

export function getMockSiteOverview(now = Date.now()): SiteOverview {
  const sim = getState(now);
  const today = startOfDay(now);
  const openAlerts = newestFirst(sim.events.filter((event) => event.status !== "Resolved"));
  const countBetween = (start: number, end: number) =>
    sim.events.filter((event) => {
      const time = new Date(event.createdAt).getTime();
      return time >= start && time < end;
    }).length;

  const snapshots: HazardSnapshot[] = newestFirst(sim.events.filter((event) => event.snapshotUrl))
    .slice(0, 6)
    .map((event) => ({
      id: `SN-${event.id.slice(3)}`,
      hazardType: event.type,
      workerId: event.workerId,
      zone: event.zone,
      capturedAt: event.createdAt,
      imageUrl: event.snapshotUrl!,
    }));

  return {
    project: siteProject,
    kpis: {
      workersOnSite: sim.workers.length,
      activeAlerts: openAlerts.length,
      hazardEventsToday: countBetween(today, now + 1),
      hazardEventsYesterday: countBetween(today - DAY, today),
      daysSinceLastIncident: Math.floor((now - LAST_INCIDENT) / DAY),
    },
    workers: sim.workers,
    geofences,
    alerts: openAlerts.map(({ id, severity, type, workerId, zone, createdAt }) => ({ id, severity, type, workerId, zone, createdAt })),
    snapshots,
    hazardRateTrend: weeklyHazardRates(sim.events, sim.workers, now),
    generatedAt: new Date(now).toISOString(),
  };
}

const DENSITY_CELL = { lat: 0.0001, lng: 0.00014 }; // ~11 m square cells

export function getMockLocationData(filters: SafetyFilters, now = Date.now()): LocationData {
  const sim = getState(now);
  const events = filterEvents(sim.events, filters, now);
  const breaches = events.filter((event) => event.category === "Zone breach");
  const workers = filterWorkers(sim.workers, filters);
  const openWorkerIds = new Set(sim.events.filter((event) => event.status !== "Resolved").map((event) => event.workerId));

  // Bin historical GPS fixes into a grid for the density layer.
  const { start, end } = resolveDateRange(filters, now);
  const [[south, west]] = siteProject.bounds;
  const cells = new Map<string, number>();
  for (const sample of sim.positionSamples) {
    if (
      sample.time < start ||
      sample.time > end ||
      (filters.zone && sample.zoneId !== filters.zone) ||
      (filters.crew && sample.crewId !== filters.crew) ||
      (filters.shift && sample.shift !== filters.shift)
    ) {
      continue;
    }
    const row = Math.floor((sample.lat - south) / DENSITY_CELL.lat);
    const col = Math.floor((sample.lng - west) / DENSITY_CELL.lng);
    const key = `${row}:${col}`;
    cells.set(key, (cells.get(key) ?? 0) + 1);
  }
  const density: DensityCell[] = [...cells.entries()].map(([key, count]) => {
    const [row, col] = key.split(":").map(Number);
    const cellSouth = south + row * DENSITY_CELL.lat;
    const cellWest = west + col * DENSITY_CELL.lng;
    return {
      bounds: [
        [cellSouth, cellWest],
        [cellSouth + DENSITY_CELL.lat, cellWest + DENSITY_CELL.lng],
      ],
      count,
    };
  });

  // Every restricted zone is listed, even at zero, so the bar chart compares like with like.
  const breachCounts = countBy(breaches, (event) => event.zoneId, zoneLabel);
  const breachesByZone = geofences
    .filter((fence) => !filters.zone || fence.id === filters.zone)
    .map((fence) => breachCounts.find((row) => row.key === fence.id) ?? { key: fence.id, label: fence.name, count: 0 })
    .sort((a, b) => b.count - a.count);

  const secondsByWorker = new Map<string, number>();
  for (const breach of breaches) {
    secondsByWorker.set(breach.workerId, (secondsByWorker.get(breach.workerId) ?? 0) + (breach.durationSec ?? 0));
  }
  const highRiskTime: WorkerZoneTime[] = [...secondsByWorker.entries()]
    .map(([workerId, seconds]) => ({
      workerId,
      crew: sim.workers.find((worker) => worker.id === workerId)?.crew ?? "",
      minutes: Math.round(seconds / 6) / 10,
    }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 10);

  const drills = sim.drills.map(({ id, date, musterMinutes, byCrew }) => ({
    id,
    date,
    musterMinutes: filters.crew ? (byCrew[filters.crew] ?? musterMinutes) : musterMinutes,
  }));

  return {
    project: siteProject,
    kpis: {
      workersOnSite: workers.length,
      breaches: breaches.length,
      loneWorkerAlerts: events.filter((event) => event.category === "Lone worker").length,
      manDownAlerts: events.filter((event) => event.category === "Man-down").length,
      manDownThresholdMin: MAN_DOWN_THRESHOLD_MIN,
    },
    workers,
    geofences,
    alertWorkerIds: workers.filter((worker) => openWorkerIds.has(worker.id)).map((worker) => worker.id),
    density,
    workersByZone: countBy(workers, currentZoneId, zoneLabel),
    breachesByZone,
    highRiskTime,
    breachLog: newestFirst(breaches),
    drills,
    generatedAt: new Date(now).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Time buckets & period comparisons (shared by the trend pages)
// ---------------------------------------------------------------------------

/** The same-length window immediately before `window`, for "vs previous period" changes. */
function previousWindow({ start, end }: TimeWindow): TimeWindow {
  return { start: start - (end - start), end: start };
}

interface Buckets {
  granularity: BucketGranularity;
  starts: number[];
  /** Index of the bucket containing `time`, or -1. */
  indexOf: (time: number) => number;
}

/** Hourly buckets for a single day, daily up to 31 days, weekly beyond that. */
function makeBuckets({ start, end }: TimeWindow): Buckets {
  const days = (end - start) / DAY;
  const granularity: BucketGranularity = days <= 1.01 ? "hour" : days <= 31 ? "day" : "week";
  const starts: number[] = [];
  if (granularity === "hour") {
    for (let t = start; t < end; t += HOUR) starts.push(t);
  } else {
    let t = granularity === "week" ? startOfWeek(start) : startOfDay(start);
    while (t < end) {
      starts.push(t);
      const next = new Date(t);
      next.setDate(next.getDate() + (granularity === "week" ? 7 : 1));
      t = next.getTime();
    }
  }
  const indexOf = (time: number) => {
    if (starts.length === 0 || time < starts[0] || time >= end) return -1;
    let i = starts.length - 1;
    while (i > 0 && starts[i] > time) i--;
    return i;
  };
  return { granularity, starts, indexOf };
}

/** Roster workers matching the crew / shift filters (zone doesn't apply to rostered hours). */
function rosterFor(filters: SafetyFilters, workers: SiteWorker[]) {
  return workers.filter(
    (worker) => (!filters.crew || worker.crewId === filters.crew) && (!filters.shift || worker.shift === filters.shift),
  );
}

/** Each calendar day in the window that has scheduled work. */
function workingDays({ start, end }: TimeWindow) {
  const days: number[] = [];
  for (let day = startOfDay(start); day < end; day = startOfDay(day + DAY + 2 * HOUR)) {
    if (shiftHoursOn(day) > 0) days.push(day);
  }
  return days;
}

/** Scheduled worker-hours in the window for the given roster. */
function workerHoursIn(window: TimeWindow, roster: SiteWorker[]) {
  return workingDays(window).reduce((sum, day) => sum + shiftHoursOn(day) * roster.length, 0);
}

const PPE_KEYS: Record<string, keyof Omit<PpeBucket, "start">> = {
  "No Hi-Vis Vest": "noVest",
  "No Harness at Height": "noHarness",
  "No Gloves": "noGloves",
  "No Hard Hat": "noHardHat",
};

export const PPE_COMPLIANCE_TARGET = 95;

/**
 * PPE compliance = share of worker-shifts with no PPE violation. For hourly buckets,
 * the share of on-shift workers with no violation in that hour.
 */
function complianceRate(violations: SafetyEvent[], window: TimeWindow, roster: SiteWorker[], hourly = false) {
  let denominator: number;
  if (hourly) {
    const hour = new Date(window.start).getHours();
    const working = shiftHoursOn(startOfDay(window.start)) > 0;
    denominator = working ? roster.filter((worker) => SHIFT_HOURS[worker.shift].includes(hour)).length : 0;
  } else {
    denominator = workingDays(window).length * roster.length;
  }
  if (denominator === 0) return null;
  const violatorShifts = new Set(
    violations.map((event) => `${event.workerId}:${hourly ? 0 : startOfDay(eventTime(event))}`),
  ).size;
  return Math.max(0, Math.round((1 - violatorShifts / denominator) * 1000) / 10);
}

function eventTime(event: SafetyEvent) {
  return new Date(event.createdAt).getTime();
}

function densityFromPoints(points: { lat: number; lng: number }[]): DensityCell[] {
  const [[south, west]] = siteProject.bounds;
  const cells = new Map<string, number>();
  for (const { lat, lng } of points) {
    const key = `${Math.floor((lat - south) / DENSITY_CELL.lat)}:${Math.floor((lng - west) / DENSITY_CELL.lng)}`;
    cells.set(key, (cells.get(key) ?? 0) + 1);
  }
  return [...cells.entries()].map(([key, count]) => {
    const [row, col] = key.split(":").map(Number);
    const cellSouth = south + row * DENSITY_CELL.lat;
    const cellWest = west + col * DENSITY_CELL.lng;
    return {
      bounds: [
        [cellSouth, cellWest],
        [cellSouth + DENSITY_CELL.lat, cellWest + DENSITY_CELL.lng],
      ],
      count,
    };
  });
}

function toSnapshot(event: SafetyEvent): HazardSnapshot {
  return {
    id: `SN-${event.id.slice(3)}`,
    hazardType: event.type,
    workerId: event.workerId,
    zone: event.zone,
    capturedAt: event.createdAt,
    imageUrl: event.snapshotUrl!,
  };
}

const CAMERA_CATEGORIES: EventCategory[] = ["PPE", "Hazard", "Near-miss"];
const ENVIRONMENT_HAZARDS: HazardType[] = [
  "Open Edge",
  "Unguarded Opening",
  "Trip Hazard",
  "Fire/Smoke",
  "Falling Object",
  "Poor Housekeeping",
];
const MAX_GALLERY = 48;

export function getMockHazardsData(filters: SafetyFilters, now = Date.now()): HazardsData {
  const sim = getState(now);
  const window = resolveDateRange(filters, now);
  const prevWindow = previousWindow(window);
  // Only compare with the previous period when the log fully covers it.
  const comparable = prevWindow.start >= sim.historyStart;
  const roster = rosterFor(filters, sim.workers);

  const isCamera = (event: SafetyEvent) => CAMERA_CATEGORIES.includes(event.category);
  const events = filterEvents(sim.events, filters, now, window).filter(isCamera);
  const prevEvents = filterEvents(sim.events, filters, now, prevWindow).filter(isCamera);
  const ppe = events.filter((event) => event.category === "PPE");
  const hazards = events.filter((event) => event.category === "Hazard");
  const nearMisses = events.filter((event) => event.category === "Near-miss");

  const buckets = makeBuckets(window);
  const bucketWindow = (i: number): TimeWindow => ({
    start: buckets.starts[i],
    end: buckets.starts[i + 1] ?? window.end,
  });

  const ppeByPeriod: PpeBucket[] = buckets.starts.map((start) => ({
    start: new Date(start).toISOString(),
    noVest: 0,
    noHarness: 0,
    noGloves: 0,
    noHardHat: 0,
  }));
  const ppeByBucket: SafetyEvent[][] = buckets.starts.map(() => []);
  for (const event of ppe) {
    const i = buckets.indexOf(eventTime(event));
    if (i < 0) continue;
    ppeByPeriod[i][PPE_KEYS[event.type]] += 1;
    ppeByBucket[i].push(event);
  }

  const complianceTrend: RateBucket[] = buckets.starts.map((start, i) => ({
    start: new Date(start).toISOString(),
    rate: complianceRate(ppeByBucket[i], bucketWindow(i), roster, buckets.granularity === "hour"),
  }));

  const nearMissTrend: CountBucket[] = buckets.starts.map((start) => ({ start: new Date(start).toISOString(), count: 0 }));
  for (const event of nearMisses) {
    const i = buckets.indexOf(eventTime(event));
    if (i >= 0) nearMissTrend[i].count += 1;
  }

  // Pareto over the six environmental hazard types, most frequent first.
  const counts = ENVIRONMENT_HAZARDS.map((type) => ({ type, count: hazards.filter((event) => event.type === type).length })).sort(
    (a, b) => b.count - a.count,
  );
  let running = 0;
  const pareto: ParetoRow[] = counts.map(({ type, count }) => {
    running += count;
    return { type, count, cumulativePct: hazards.length ? Math.round((running / hazards.length) * 1000) / 10 : 0 };
  });

  const hourDay: HourDayCell[] = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    for (let hour = 0; hour < 24; hour++) hourDay.push({ weekday, hour, count: 0 });
  }
  for (const event of events) {
    const date = new Date(event.createdAt);
    hourDay[((date.getDay() + 6) % 7) * 24 + date.getHours()].count += 1;
  }

  const top = pareto[0];
  return {
    project: siteProject,
    kpis: {
      hazardEvents: events.length,
      hazardEventsPrev: comparable ? prevEvents.length : null,
      ppeCompliance: complianceRate(ppe, window, roster),
      ppeCompliancePrev: comparable
        ? complianceRate(
            prevEvents.filter((event) => event.category === "PPE"),
            prevWindow,
            roster,
          )
        : null,
      nearMisses: nearMisses.length,
      nearMissesPrev: comparable ? prevEvents.filter((event) => event.category === "Near-miss").length : null,
      topHazard:
        top && top.count > 0
          ? { type: top.type, count: top.count, share: Math.round((top.count / hazards.length) * 100) }
          : null,
    },
    granularity: buckets.granularity,
    ppeByPeriod,
    complianceTrend,
    complianceTarget: PPE_COMPLIANCE_TARGET,
    pareto,
    nearMissTrend,
    hourDay,
    geofences,
    locationDensity: densityFromPoints(events),
    snapshots: newestFirst(events.filter((event) => event.snapshotUrl)).slice(0, MAX_GALLERY).map(toSnapshot),
    generatedAt: new Date(now).toISOString(),
  };
}
