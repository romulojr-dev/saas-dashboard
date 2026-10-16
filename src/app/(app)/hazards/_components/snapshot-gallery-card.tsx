"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { CardStatusProps } from "@/components/safety/card-states";
import { CardEmpty } from "@/components/safety/card-states";
import { SafetyCard } from "@/components/safety/safety-card";
import { SnapshotGallery } from "@/components/safety/snapshot-gallery";
import { describeRange } from "@/lib/safety-filters";
import type { HazardSnapshot, HazardsData, SafetyFilters } from "@/types";

const ALL = "all";
const PAGE_SIZE = 9;

function FilterableGallery({ snapshots }: { snapshots: HazardSnapshot[] }) {
  const [type, setType] = useState<string>(ALL);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const types = [...new Set(snapshots.map((snapshot) => snapshot.hazardType))].sort();
  const items = [{ value: ALL, label: "All hazard types" }, ...types.map((t) => ({ value: t, label: t }))];
  const filtered = type === ALL ? snapshots : snapshots.filter((snapshot) => snapshot.hazardType === type);
  const shown = filtered.slice(0, visible);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select
          value={type}
          items={items}
          onValueChange={(value) => {
            setType(value ?? ALL);
            setVisible(PAGE_SIZE);
          }}
        >
          <SelectTrigger size="sm" aria-label="Filter snapshots by hazard type" className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs" aria-live="polite">
          Showing {shown.length} of {filtered.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <CardEmpty icon={ImageOff} title="No snapshots of this type" description="Try another hazard type." />
      ) : (
        <SnapshotGallery snapshots={shown} className="sm:grid-cols-3" showDate />
      )}

      {visible < filtered.length && (
        <Button variant="outline" size="sm" className="self-center" onClick={() => setVisible((n) => n + PAGE_SIZE)}>
          Show more
        </Button>
      )}
    </div>
  );
}

export function SnapshotGalleryCard({
  data,
  status,
  filters,
}: {
  data: HazardsData | null;
  status: CardStatusProps;
  filters: SafetyFilters;
}) {
  return (
    <SafetyCard
      title="Flagged Snapshots"
      description={`Hard-hat camera frames, newest first · ${describeRange(filters)}`}
      data={data}
      status={status}
      isEmpty={(d) => d.snapshots.length === 0}
      empty={{ icon: ImageOff, title: "No flagged snapshots", description: "No camera frames match the current filters." }}
      loading={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="aspect-4/3 w-full" />
          ))}
        </div>
      }
    >
      {(d) => <FilterableGallery snapshots={d.snapshots} />}
    </SafetyCard>
  );
}
