import {
  Camera,
  CameraOff,
  CircleCheck,
  CircleDot,
  Eye,
  EyeOff,
  type LucideIcon,
  Wifi,
  WifiOff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AlertStatus, CameraStatus, DeviceStatus } from "@/types";

// Icon + text label for every status, so colour is never the only signal.
const alertStatusStyles: Record<AlertStatus, { icon: LucideIcon; className: string }> = {
  Open: { icon: CircleDot, className: "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200" },
  Acknowledged: { icon: Eye, className: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200" },
  Resolved: { icon: CircleCheck, className: "bg-green-100 text-green-900 dark:bg-green-500/20 dark:text-green-200" },
};

export function AlertStatusBadge({ status, className }: { status: AlertStatus; className?: string }) {
  const { icon: Icon, className: tone } = alertStatusStyles[status];
  return (
    <Badge className={cn(tone, className)}>
      <Icon data-icon="inline-start" aria-hidden="true" />
      {status}
    </Badge>
  );
}

const deviceStatusStyles: Record<DeviceStatus, { icon: LucideIcon; className: string }> = {
  Online: { icon: Wifi, className: "bg-green-100 text-green-900 dark:bg-green-500/20 dark:text-green-200" },
  Offline: { icon: WifiOff, className: "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200" },
};

export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const { icon: Icon, className } = deviceStatusStyles[status];
  return (
    <Badge className={className}>
      <Icon data-icon="inline-start" aria-hidden="true" />
      {status}
    </Badge>
  );
}

const cameraStatusStyles: Record<CameraStatus, { icon: LucideIcon; className: string }> = {
  OK: { icon: Camera, className: "bg-green-100 text-green-900 dark:bg-green-500/20 dark:text-green-200" },
  Obstructed: { icon: EyeOff, className: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200" },
  Blackout: { icon: CameraOff, className: "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200" },
  Off: { icon: CameraOff, className: "bg-muted text-muted-foreground" },
};

export function CameraStatusBadge({ status }: { status: CameraStatus }) {
  const { icon: Icon, className } = cameraStatusStyles[status];
  return (
    <Badge className={className}>
      <Icon data-icon="inline-start" aria-hidden="true" />
      {status}
    </Badge>
  );
}
