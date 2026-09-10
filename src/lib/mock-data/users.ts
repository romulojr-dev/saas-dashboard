import { faker } from "@faker-js/faker";

import type { User } from "@/types";

export function makeSuperAdmin(): User {
  return {
    id: faker.string.uuid(),
    tenantId: null,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: "SuperAdmin",
    avatarUrl: faker.image.avatar(),
    isActive: true,
  };
}

export function makeUser(tenantId: string, role: Exclude<User["role"], "SuperAdmin">): User {
  return {
    id: faker.string.uuid(),
    tenantId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role,
    avatarUrl: faker.image.avatar(),
    isActive: faker.datatype.boolean({ probability: 0.9 }),
  };
}

export function makeUsersForTenant(tenantId: string): User[] {
  return [
    makeUser(tenantId, "TenantAdmin"),
    ...Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
      makeUser(tenantId, "SalesDirector")
    ),
    ...Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
      makeUser(tenantId, "MarketingRep")
    ),
  ];
}
