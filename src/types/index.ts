// 1. The Organization (Multi-Tenancy Foundation)
export interface Tenant {
  id: string; // e.g., "tenant_abc123"
  name: string; // e.g., "Acme Shoes"
  planTier: 'Basic' | 'Pro' | 'Enterprise';
  status: 'Active' | 'PastDue' | 'Canceled';
  monthlySpend: number; // Feeds the Super Admin MRR calculation
  createdAt: string; // ISO Date string
}

// 2. The Platform Users (Employees logging in)
export interface User {
  id: string;
  tenantId: string | null; // Null if this user is a Super Admin
  name: string;
  email: string;
  role: 'SuperAdmin' | 'TenantAdmin' | 'SalesDirector' | 'MarketingRep';
  avatarUrl?: string;
  isActive: boolean;
}

// 3. The CRM Contacts (Your 1,000+ row dataset for TanStack Table)
export interface Lead {
  id: string;
  tenantId: string; // Critical: Ties this lead strictly to one company
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  companyName: string;
  status: 'New' | 'Cold' | 'Warm' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  estimatedValue: number; // Feeds the "Sales Pipeline Value" metric card
  createdAt: string;
  lastContactedAt: string;
}

// 4. Marketing Campaigns (For your Recharts visual engagement graphs)
export interface Campaign {
  id: string;
  tenantId: string;
  campaignName: string; // e.g., "Spring Shoe Sale 2026"
  sentDate: string;
  emailsSent: number; // Represents the gray bar in your sketch
  emailsOpened: number; // Represents the blue bar in your sketch
  clicks: number;
}