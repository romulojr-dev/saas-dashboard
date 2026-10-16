import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown by a page's <Suspense> boundary while the URL filters are read on the client:
 * the real heading and subheading, with placeholders for the filter bar and cards.
 */
export function FilteredPageFallback({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-4">
      <header className="space-y-1">
        <h1 className="font-heading font-semibold text-2xl tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </header>
      <div role="status" className="flex flex-col gap-4">
        <span className="sr-only">Loading {title}…</span>
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}
