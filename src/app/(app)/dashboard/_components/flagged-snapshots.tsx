"use client";

import { ImageOff } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { SafetyCard } from "@/components/safety/safety-card";
import { SnapshotGallery } from "@/components/safety/snapshot-gallery";
import type { HazardSnapshot } from "@/types";

export function FlaggedSnapshots({
  snapshots,
  status,
  className,
}: {
  snapshots: HazardSnapshot[] | null;
  status: CardStatusProps;
  className?: string;
}) {
  return (
    <SafetyCard
      title="Latest Flagged Snapshots"
      description="From hard-hat cameras"
      data={snapshots}
      status={status}
      isEmpty={(rows) => rows.length === 0}
      empty={{ icon: ImageOff, title: "No flagged snapshots", description: "Camera frames flagged as hazards will appear here." }}
      loading={
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="aspect-4/3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      }
      className={className}
    >
      {(rows) => <SnapshotGallery snapshots={rows} />}
    </SafetyCard>
  );
}
