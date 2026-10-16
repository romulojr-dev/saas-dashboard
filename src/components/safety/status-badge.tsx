import { CircleCheck, CircleDot, Eye, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AlertStatus } from "@/types";

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
