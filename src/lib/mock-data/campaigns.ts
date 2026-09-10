import { faker } from "@faker-js/faker";

import type { Campaign } from "@/types";

export function makeCampaign(tenantId: string): Campaign {
  const emailsSent = faker.number.int({ min: 200, max: 20_000 });
  const emailsOpened = faker.number.int({
    min: 0,
    max: Math.round(emailsSent * 0.6),
  });
  const clicks = faker.number.int({ min: 0, max: Math.round(emailsOpened * 0.4) });

  return {
    id: faker.string.uuid(),
    tenantId,
    campaignName: `${faker.commerce.productAdjective()} ${faker.commerce.department()} ${faker.helpers.arrayElement(["Sale", "Launch", "Update", "Newsletter"])}`,
    sentDate: faker.date.past({ years: 1 }).toISOString(),
    emailsSent,
    emailsOpened,
    clicks,
  };
}

export function makeCampaignsForTenant(tenantId: string, count: number): Campaign[] {
  return Array.from({ length: count }, () => makeCampaign(tenantId));
}
