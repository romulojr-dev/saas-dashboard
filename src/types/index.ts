// 1. The Organization (Multi-Tenancy Foundation)
export interface Tenant {
  id: string; // e.g., "tenant_abc123"
  name: string; // e.g., "Acme Shoes"
  planTier: 'Basic' | 'Pro' | 'Enterprise';
  status: 'Active' | 'PastDue' | 'Canceled';
  monthlySpend: number; // Feeds the Super Admin MRR calculation
  createdAt: string; // ISO Date string
}

// 2. The Platform Users (Employees logging in)
export interface User {
  id: string;
  tenantId: string | null; // Null if this user is a Super Admin
  name: string;
  email: string;
  role: 'SuperAdmin' | 'TenantAdmin' | 'SalesDirector' | 'MarketingRep';
  avatarUrl?: string;
  isActive: boolean;
}

// 3. The CRM Contacts (Your 1,000+ row dataset for TanStack Table)
export interface Lead {
  id: string;
  tenantId: string; // Critical: Ties this lead strictly to one company
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  companyName: string;
  status: 'New' | 'Cold' | 'Warm' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  estimatedValue: number; // Feeds the "Sales Pipeline Value" metric card
  createdAt: string;
  lastContactedAt: string;
}

// 4. Marketing Campaigns (For your Recharts visual engagement graphs)
export interface Campaign {
  id: string;
  tenantId: string;
  campaignName: string; // e.g., "Spring Shoe Sale 2026"
  status: 'Draft' | 'Scheduled' | 'Sent';
  sentDate: string | null; // null for Draft/Scheduled
  emailsSent: number; // Represents the gray bar in your sketch
  emailsOpened: number; // Represents the blue bar in your sketch
  clicks: number;
}

// 5. Site Safety Monitoring (hard-hat camera + GPS telemetry)
export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

// What raised the event: the helmet camera (computer vision) or GPS telemetry
export type EventCategory = 'PPE' | 'Hazard' | 'Near-miss' | 'Zone breach' | 'Lone worker' | 'Man-down';

export type HazardType =
  // PPE violations (camera)
  | 'No Hard Hat'
  | 'No Hi-Vis Vest'
  | 'No Harness at Height'
  | 'No Gloves'
  // Environmental hazards (camera)
  | 'Open Edge'
  | 'Unguarded Opening'
  | 'Trip Hazard'
  | 'Fire/Smoke'
  | 'Falling Object'
  | 'Poor Housekeeping'
  // Near-misses (camera)
  | 'Machinery Near-Miss'
  // GPS-based
  | 'Restricted Zone Entry'
  | 'Lone Worker'
  | 'Man-Down';

export type Shift = 'Day' | 'Night';

export type ZoneKind = 'Work area' | 'Restricted';

export interface SiteZone {
  id: string; // e.g., "crane-swing"
  name: string; // e.g., "Crane Swing Radius"
  kind: ZoneKind;
}

export interface Crew {
  id: string; // e.g., "steel"
  name: string; // e.g., "Steel Erection"
  subcontractor: string; // e.g., "Apex Steel Inc."
}

// Named SiteWorker (not Worker) to avoid shadowing the DOM's global Worker type.
// Workers are identified by ID only; no personal names are stored or shown (PH Data Privacy Act).
export interface SiteWorker {
  id: string; // e.g., "W-014"
  crewId: string;
  crew: string; // crew display name
  shift: Shift;
  lat: number;
  lng: number;
  lastSeen: string; // ISO Date string of the latest GPS fix
}

// Restricted zone drawn on the site map; `id` matches its SiteZone id
export interface Geofence {
  id: string;
  name: string; // e.g., "Crane Swing Radius"
  polygon: [lat: number, lng: number][];
}

export interface SafetyAlert {
  id: string;
  severity: AlertSeverity;
  type: HazardType;
  workerId: string;
  zone: string;
  createdAt: string; // ISO Date string
}

export type AlertStatus = 'Open' | 'Acknowledged' | 'Resolved';

// One row of the site's event log. Every page aggregates from these.
export interface SafetyEvent extends SafetyAlert {
  category: EventCategory;
  zoneId: string;
  crewId: string;
  shift: Shift;
  status: AlertStatus;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  assignedTo: string | null; // safety officer ID, e.g., "SO-02"
  durationSec: number | null; // time in zone (breaches) or without movement (man-down)
  snapshotUrl: string | null; // camera-raised events only
  lat: number; // where the event was raised
  lng: number;
}

// A frame flagged by a hard-hat camera
export interface HazardSnapshot {
  id: string;
  hazardType: HazardType;
  workerId: string;
  zone: string;
  capturedAt: string; // ISO Date string
  imageUrl: string;
}

export interface SiteKpis {
  workersOnSite: number;
  activeAlerts: number;
  hazardEventsToday: number;
  hazardEventsYesterday: number;
  daysSinceLastIncident: number;
}

export interface WeeklyHazardRate {
  weekStart: string; // ISO Date string (Monday)
  ratePer100WorkerHours: number;
}

export interface SiteProject {
  name: string;
  location: string;
  center: [lat: number, lng: number];
  bounds: [southWest: [number, number], northEast: [number, number]];
}

// Everything the Site Safety Overview page renders, fetched as one payload
export interface SiteOverview {
  project: SiteProject;
  kpis: SiteKpis;
  workers: SiteWorker[];
  geofences: Geofence[];
  alerts: SafetyAlert[]; // newest first
  snapshots: HazardSnapshot[]; // newest first
  hazardRateTrend: WeeklyHazardRate[]; // oldest first, last 12 weeks
  generatedAt: string; // ISO Date string
}

// ---- Filters shared by the detail pages (mirrored in the URL query string) ----
export type DateRangePreset = 'today' | '7d' | '30d' | 'custom';

export interface SafetyFilters {
  range: DateRangePreset;
  from: string | null; // "YYYY-MM-DD", custom range only
  to: string | null; // "YYYY-MM-DD", custom range only
  zone: string | null; // SiteZone id
  crew: string | null; // Crew id
  shift: Shift | null;
}

export interface FilterOptions {
  zones: SiteZone[];
  crews: Crew[];
}

export interface CountByKey {
  key: string; // id used for filtering/linking
  label: string;
  count: number;
}

// ---- Page 1: Location & Movement ----
export interface DensityCell {
  bounds: [southWest: [number, number], northEast: [number, number]];
  count: number; // GPS fixes in the cell over the selected period
}

export interface WorkerZoneTime {
  workerId: string;
  crew: string;
  minutes: number;
}

export interface DrillResult {
  id: string;
  date: string; // ISO Date string
  musterMinutes: number;
}

export interface LocationData {
  project: SiteProject;
  kpis: {
    workersOnSite: number;
    breaches: number;
    loneWorkerAlerts: number;
    manDownAlerts: number;
    manDownThresholdMin: number;
  };
  workers: SiteWorker[]; // live positions
  geofences: Geofence[];
  alertWorkerIds: string[]; // workers with an open alert, for marker styling
  density: DensityCell[];
  workersByZone: CountByKey[]; // live
  breachesByZone: CountByKey[];
  highRiskTime: WorkerZoneTime[]; // top 10, most time first
  breachLog: SafetyEvent[]; // newest first
  drills: DrillResult[]; // oldest first, last 5
  generatedAt: string;
}

// ---- Page 2: Hazard Detection ----
/** Time-series bucket size, chosen from the length of the date range. */
export type BucketGranularity = 'hour' | 'day' | 'week';

export interface PpeBucket {
  start: string; // ISO Date string
  noVest: number;
  noHarness: number;
  noGloves: number;
  noHardHat: number; // camera sees another worker without a hard hat
}

export interface RateBucket {
  start: string;
  rate: number | null; // percent; null when nobody was on shift (e.g. Sunday)
}

export interface CountBucket {
  start: string;
  count: number;
}

export interface ParetoRow {
  type: HazardType;
  count: number;
  cumulativePct: number;
}

export interface HourDayCell {
  weekday: number; // 0 = Monday … 6 = Sunday
  hour: number; // 0–23
  count: number;
}

export interface HazardsData {
  project: SiteProject;
  kpis: {
    hazardEvents: number;
    hazardEventsPrev: number | null; // null when the previous period predates the data
    ppeCompliance: number | null; // percent of worker-shifts with no PPE violation
    ppeCompliancePrev: number | null;
    nearMisses: number;
    nearMissesPrev: number | null;
    topHazard: { type: HazardType; count: number; share: number } | null;
  };
  granularity: BucketGranularity;
  ppeByPeriod: PpeBucket[];
  complianceTrend: RateBucket[];
  complianceTarget: number; // percent
  pareto: ParetoRow[]; // most frequent first
  nearMissTrend: CountBucket[];
  hourDay: HourDayCell[];
  geofences: Geofence[];
  locationDensity: DensityCell[];
  snapshots: HazardSnapshot[]; // newest first
  generatedAt: string;
}
