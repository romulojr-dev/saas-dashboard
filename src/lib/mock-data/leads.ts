import { faker } from "@faker-js/faker";

import type { Lead } from "@/types";

export function makeLead(tenantId: string): Lead {
  const createdAt = faker.date.past({ years: 2 });
  const lastContactedAt = faker.date.between({
    from: createdAt,
    to: new Date(),
  });

  return {
    id: faker.string.uuid(),
    tenantId,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    jobTitle: faker.person.jobTitle(),
    companyName: faker.company.name(),
    status: faker.helpers.arrayElement<Lead["status"]>([
      "New",
      "Cold",
      "Warm",
      "Negotiation",
      "Closed Won",
      "Closed Lost",
    ]),
    estimatedValue: faker.number.int({ min: 500, max: 75_000 }),
    createdAt: createdAt.toISOString(),
    lastContactedAt: lastContactedAt.toISOString(),
  };
}

export function makeLeadsForTenant(tenantId: string, count: number): Lead[] {
  return Array.from({ length: count }, () => makeLead(tenantId));
}
