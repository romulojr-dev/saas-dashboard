import { CircleAlert, Info, type LucideIcon, OctagonAlert, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AlertSeverity } from "@/types";

// Each severity carries an icon and its text label, so colour is never the only signal.
const severityStyles: Record<AlertSeverity, { icon: LucideIcon; className: string }> = {
  Critical: { icon: OctagonAlert, className: "bg-red-700 text-white dark:bg-red-600 dark:text-white" },
  High: { icon: TriangleAlert, className: "bg-orange-100 text-orange-900 dark:bg-orange-500/20 dark:text-orange-200" },
  Medium: { icon: CircleAlert, className: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200" },
  Low: { icon: Info, className: "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200" },
};

export function SeverityBadge({ severity, className }: { severity: AlertSeverity; className?: string }) {
  const { icon: Icon, className: tone } = severityStyles[severity];
  return (
    <Badge className={cn(tone, className)}>
      <Icon data-icon="inline-start" aria-hidden="true" />
      {severity}
    </Badge>
  );
}
