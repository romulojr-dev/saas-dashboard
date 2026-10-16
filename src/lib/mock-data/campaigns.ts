import { faker } from "@faker-js/faker";

import type { Campaign } from "@/types";

export function makeCampaign(tenantId: string): Campaign {
  const status = faker.helpers.arrayElement<Campaign["status"]>(["Draft", "Scheduled", "Sent", "Sent", "Sent"]);
  const isSent = status === "Sent";

  const emailsSent = isSent ? faker.number.int({ min: 200, max: 20_000 }) : 0;
  const emailsOpened = isSent
    ? faker.number.int({ min: 0, max: Math.round(emailsSent * 0.6) })
    : 0;
  const clicks = isSent ? faker.number.int({ min: 0, max: Math.round(emailsOpened * 0.4) }) : 0;

  return {
    id: faker.string.uuid(),
    tenantId,
    campaignName: `${faker.commerce.productAdjective()} ${faker.commerce.department()} ${faker.helpers.arrayElement(["Sale", "Launch", "Update", "Newsletter"])}`,
    status,
    sentDate: isSent ? faker.date.past({ years: 1 }).toISOString() : null,
    emailsSent,
    emailsOpened,
    clicks,
  };
}

export function makeCampaignsForTenant(tenantId: string, count: number): Campaign[] {
  return Array.from({ length: count }, () => makeCampaign(tenantId));
}
