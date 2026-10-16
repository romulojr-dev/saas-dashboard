import type { Metadata } from "next";

import { SiteSafetyOverview } from "./_components/site-safety-overview";

export const metadata: Metadata = {
  title: "Site Safety Overview",
};

export default function Page() {
  return <SiteSafetyOverview />;
}
