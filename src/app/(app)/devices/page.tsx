import type { Metadata } from "next";
import { Suspense } from "react";

import { FilteredPageFallback } from "@/components/safety/page-shell";
import { DevicesView } from "./_components/devices-view";
import { PAGE_SUBTITLE, PAGE_TITLE } from "./_components/page-info";

export const metadata: Metadata = {
  title: PAGE_TITLE,
};

export default function Page() {
  // Filters are read from the URL on the client, so the view sits inside Suspense.
  return (
    <Suspense fallback={<FilteredPageFallback title={PAGE_TITLE} subtitle={PAGE_SUBTITLE} />}>
      <DevicesView />
    </Suspense>
  );
}
