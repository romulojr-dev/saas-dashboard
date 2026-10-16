import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { DEFAULT_FILTERS, parseFilters, serializeFilters } from "@/lib/safety-filters";
import type { SafetyFilters } from "@/types";

/**
 * Filters for the Site Safety pages, stored in the URL query string so a filtered
 * view can be shared or bookmarked. Components using this must sit inside <Suspense>.
 */
export function useSafetyFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const filters = useMemo(() => parseFilters(new URLSearchParams(searchParams.toString())), [searchParams]);
  /** Stable string form of the filters, used as the data-fetch key. */
  const filtersKey = serializeFilters(filters);

  const setFilters = useCallback(
    (next: Partial<SafetyFilters>) => {
      const params = new URLSearchParams(serializeFilters({ ...filters, ...next }));
      // Keep unrelated params (e.g. ?mock=) intact.
      for (const [name, value] of searchParams.entries()) {
        if (!["range", "from", "to", "zone", "crew", "shift"].includes(name)) params.set(name, value);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router, searchParams],
  );

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [setFilters]);

  return { filters, filtersKey, setFilters, resetFilters };
}
