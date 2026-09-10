import { faker } from "@faker-js/faker";

import type { Campaign, Lead, Tenant, User } from "@/types";
import { makeCampaignsForTenant } from "./campaigns";
import { makeLeadsForTenant } from "./leads";
import { makeTenants } from "./tenants";
import { makeSuperAdmin, makeUsersForTenant } from "./users";

const TENANT_COUNT = 12;
const LEADS_PER_TENANT = 90;
const CAMPAIGNS_PER_TENANT = 8;

faker.seed(42);

export const tenants: Tenant[] = makeTenants(TENANT_COUNT);

export const users: User[] = [
  makeSuperAdmin(),
  ...tenants.flatMap((tenant) => makeUsersForTenant(tenant.id)),
];

export const leads: Lead[] = tenants.flatMap((tenant) =>
  makeLeadsForTenant(tenant.id, LEADS_PER_TENANT)
);

export const campaigns: Campaign[] = tenants.flatMap((tenant) =>
  makeCampaignsForTenant(tenant.id, CAMPAIGNS_PER_TENANT)
);

export * from "./campaigns";
export * from "./leads";
export * from "./tenants";
export * from "./users";
