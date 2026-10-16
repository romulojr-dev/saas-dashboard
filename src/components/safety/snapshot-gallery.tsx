"use client";

import Image from "next/image";
import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { HazardSnapshot } from "@/types";
import { formatClock, formatDateTime } from "./format";

function describe(snapshot: HazardSnapshot) {
  return `${snapshot.hazardType} — worker ${snapshot.workerId} at ${snapshot.zone}, ${formatDateTime(snapshot.capturedAt)}`;
}

/**
 * Thumbnail grid of hard-hat camera frames. Each thumbnail is a button that opens a larger
 * view with hazard type, worker ID, zone and capture time.
 */
export function SnapshotGallery({
  snapshots,
  className,
  showDate = false,
}: {
  snapshots: HazardSnapshot[];
  className?: string;
  /** Show the date in captions (for multi-day ranges), not just the time. */
  showDate?: boolean;
}) {
  // Kept separate from `open` so the dialog content stays rendered during its close animation.
  const [selected, setSelected] = useState<HazardSnapshot | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <ul className={cn("grid grid-cols-2 gap-3", className)}>
        {snapshots.map((snapshot) => (
          <li key={snapshot.id} className="min-w-0">
            <button
              type="button"
              onClick={() => {
                setSelected(snapshot);
                setOpen(true);
              }}
              aria-label={`Open larger view: ${describe(snapshot)}`}
              className="group relative block aspect-4/3 w-full overflow-hidden rounded-md ring-1 ring-foreground/10 outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <Image
                src={snapshot.imageUrl}
                alt={`Hard-hat camera frame: ${describe(snapshot)}`}
                fill
                sizes="(min-width: 1024px) 15vw, 50vw"
                className="object-cover transition-transform group-hover:scale-105 motion-reduce:transition-none"
              />
            </button>
            <p className="mt-1.5 truncate font-medium text-xs">{snapshot.hazardType}</p>
            <p className="truncate text-muted-foreground text-xs">
              {snapshot.workerId} · {snapshot.zone} ·{" "}
              <time dateTime={snapshot.capturedAt} className="tabular-nums">
                {showDate ? formatDateTime(snapshot.capturedAt) : formatClock(snapshot.capturedAt)}
              </time>
            </p>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.hazardType}</DialogTitle>
                <DialogDescription>
                  Worker {selected.workerId} · {selected.zone} · captured{" "}
                  <time dateTime={selected.capturedAt}>{formatDateTime(selected.capturedAt)}</time>
                </DialogDescription>
              </DialogHeader>
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-md ring-1 ring-foreground/10">
                <Image
                  src={selected.imageUrl}
                  alt={`Hard-hat camera frame: ${describe(selected)}`}
                  fill
                  sizes="(min-width: 640px) 42rem, 100vw"
                  className="object-contain"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
