"use client";

import { Circle, CircleCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatDateTime, formatDuration } from "@/components/safety/format";
import { SeverityBadge } from "@/components/safety/severity-badge";
import { AlertStatusBadge } from "@/components/safety/status-badge";
import { acknowledgeAlert, CURRENT_OFFICER, resolveAlert } from "@/lib/services/site-safety";
import { cn } from "@/lib/utils";
import type { AlertStatus, SafetyEvent } from "@/types";

const statusRank: Record<AlertStatus, number> = { Open: 0, Acknowledged: 1, Resolved: 2 };

function minutesBetween(from: string, to: string) {
  return (new Date(to).getTime() - new Date(from).getTime()) / 1000;
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}

/** Raised → Acknowledged → Resolved, each step marked done or pending in text and icon. */
function StatusTimeline({ alert }: { alert: SafetyEvent }) {
  const steps = [
    { label: "Raised", at: alert.createdAt, note: "Detected by hard-hat sensors" },
    {
      label: "Acknowledged",
      at: alert.acknowledgedAt,
      note: alert.acknowledgedAt
        ? `By ${alert.assignedTo ?? "safety team"} · ${formatDuration(minutesBetween(alert.createdAt, alert.acknowledgedAt))} after raised`
        : null,
    },
    {
      label: "Resolved",
      at: alert.resolvedAt,
      note:
        alert.resolvedAt && alert.acknowledgedAt
          ? `${formatDuration(minutesBetween(alert.acknowledgedAt, alert.resolvedAt))} after acknowledged`
          : null,
    },
  ];

  return (
    <ol className="relative space-y-4" aria-label="Status timeline">
      {steps.map((step, i) => {
        const done = step.at !== null;
        const Icon = done ? CircleCheck : Circle;
        return (
          <li key={step.label} className="relative flex gap-3">
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn("absolute top-6 left-2.5 h-[calc(100%-0.5rem)] w-px", done ? "bg-green-600" : "bg-border")}
              />
            )}
            <Icon
              className={cn("relative size-5 shrink-0", done ? "text-green-700 dark:text-green-400" : "text-muted-foreground")}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="font-medium">
                {step.label}
                <span className="sr-only">{done ? ": done" : ": pending"}</span>
              </p>
              {done ? (
                <>
                  <time dateTime={step.at!} className="block text-muted-foreground text-xs tabular-nums">
                    {formatDateTime(step.at!)}
                  </time>
                  {step.note && <p className="text-muted-foreground text-xs">{step.note}</p>}
                </>
              ) : (
                <p className="text-muted-foreground text-xs">Pending</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function AlertDetailSheet({
  alertId,
  log,
  open,
  onOpenChange,
  onChanged,
}: {
  alertId: string | null;
  log: SafetyEvent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful update so the page refetches in the background. */
  onChanged: () => void;
}) {
  // The mutation response is shown immediately; the next poll brings the same state from the log.
  const [updated, setUpdated] = useState<SafetyEvent | null>(null);
  const [pending, setPending] = useState<"acknowledge" | "resolve" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fromLog = log.find((event) => event.id === alertId) ?? null;
  const fresh = updated?.id === alertId ? updated : null;
  const alert =
    fresh && (!fromLog || statusRank[fresh.status] > statusRank[fromLog.status]) ? fresh : (fromLog ?? fresh);

  const run = async (action: "acknowledge" | "resolve") => {
    if (!alert) return;
    setPending(action);
    setActionError(null);
    try {
      const result = action === "acknowledge" ? await acknowledgeAlert(alert.id) : await resolveAlert(alert.id);
      setUpdated(result);
      onChanged();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "The update failed. Please try again.");
    } finally {
      setPending(null);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setActionError(null);
        onOpenChange(next);
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {alert ? (
          <>
            <SheetHeader className="pr-12">
              <SheetTitle>
                {alert.type} <span className="font-mono font-normal text-muted-foreground text-sm">{alert.id}</span>
              </SheetTitle>
              <SheetDescription>
                {alert.category} alert · worker {alert.workerId} · {alert.zone}
              </SheetDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                <SeverityBadge severity={alert.severity} />
                <AlertStatusBadge status={alert.status} />
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4">
              {alert.snapshotUrl && (
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-md ring-1 ring-foreground/10">
                  <Image
                    src={alert.snapshotUrl}
                    alt={`Hard-hat camera frame for ${alert.id}: ${alert.type}, worker ${alert.workerId} at ${alert.zone}, ${formatDateTime(alert.createdAt)}`}
                    fill
                    sizes="(min-width: 640px) 28rem, 100vw"
                    className="object-cover"
                  />
                </div>
              )}

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Detail label="Raised">{formatDateTime(alert.createdAt)}</Detail>
                <Detail label="Worker ID">{alert.workerId}</Detail>
                <Detail label="Zone">{alert.zone}</Detail>
                <Detail label="Shift">{alert.shift}</Detail>
                <Detail label="Crew ID">{alert.crewId}</Detail>
                <Detail label="Assigned to">{alert.assignedTo ?? "Unassigned"}</Detail>
                {alert.durationSec !== null && (
                  <Detail label={alert.category === "Man-down" ? "No movement for" : "Time in zone"}>
                    {formatDuration(alert.durationSec)}
                  </Detail>
                )}
                <Detail label="Source">{alert.snapshotUrl ? "Helmet camera" : "Helmet GPS"}</Detail>
              </dl>

              <section aria-labelledby="timeline-heading" className="space-y-3">
                <h3 id="timeline-heading" className="font-medium text-sm">
                  Status timeline
                </h3>
                <StatusTimeline alert={alert} />
              </section>

              {actionError && (
                <p role="alert" className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                  {actionError}
                </p>
              )}
            </div>

            <SheetFooter className="border-t">
              {alert.status === "Resolved" ? (
                <p className="text-muted-foreground text-sm">This alert is resolved. No further action needed.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {alert.status === "Open" && (
                    <Button variant="outline" onClick={() => run("acknowledge")} disabled={pending !== null}>
                      {pending === "acknowledge" && <Loader2 className="animate-spin" aria-hidden="true" />}
                      Acknowledge
                    </Button>
                  )}
                  <Button onClick={() => run("resolve")} disabled={pending !== null}>
                    {pending === "resolve" && <Loader2 className="animate-spin" aria-hidden="true" />}
                    Resolve
                  </Button>
                  <p className="basis-full text-muted-foreground text-xs">Actions are recorded as {CURRENT_OFFICER}.</p>
                </div>
              )}
              <p className="sr-only" aria-live="polite">
                {pending ? `${pending === "acknowledge" ? "Acknowledging" : "Resolving"} ${alert.id}…` : `Status: ${alert.status}`}
              </p>
            </SheetFooter>
          </>
        ) : (
          <SheetHeader>
            <SheetTitle>Alert not found</SheetTitle>
            <SheetDescription>It may no longer match the current filters.</SheetDescription>
          </SheetHeader>
        )}
      </SheetContent>
    </Sheet>
  );
}
