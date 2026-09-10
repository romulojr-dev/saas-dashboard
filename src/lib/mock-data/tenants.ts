import { faker } from "@faker-js/faker";

import type { Tenant } from "@/types";

const SPEND_RANGES: Record<Tenant["planTier"], [number, number]> = {
  Basic: [49, 99],
  Pro: [199, 499],
  Enterprise: [999, 4999],
};

export function makeTenant(): Tenant {
  const planTier = faker.helpers.arrayElement<Tenant["planTier"]>([
    "Basic",
    "Pro",
    "Enterprise",
  ]);
  const [min, max] = SPEND_RANGES[planTier];

  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    planTier,
    status: faker.helpers.weightedArrayElement<Tenant["status"]>([
      { value: "Active", weight: 8 },
      { value: "PastDue", weight: 1 },
      { value: "Canceled", weight: 1 },
    ]),
    monthlySpend: faker.number.int({ min, max }),
    createdAt: faker.date.past({ years: 3 }).toISOString(),
  };
}

export function makeTenants(count: number): Tenant[] {
  return Array.from({ length: count }, makeTenant);
}
