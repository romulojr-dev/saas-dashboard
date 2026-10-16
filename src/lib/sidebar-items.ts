import {
  ChartBar,
  HardHat,
  LayoutDashboard,
  type LucideIcon,
  MapPin,
  Megaphone,
  ScanEye,
  Siren,
  TrendingUp,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Site Safety",
    items: [
      {
        id: "overview",
        title: "Overview",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "location",
        title: "Location & Movement",
        url: "/location",
        icon: MapPin,
      },
      {
        id: "hazards",
        title: "Hazard Detection",
        url: "/hazards",
        icon: ScanEye,
      },
      {
        id: "alerts",
        title: "Alerts & Response",
        url: "/alerts",
        icon: Siren,
      },
      {
        id: "workforce",
        title: "Workforce & Trends",
        url: "/workforce",
        icon: TrendingUp,
      },
      {
        id: "devices",
        title: "Device Health",
        url: "/devices",
        icon: HardHat,
      },
    ],
  },
  {
    id: 2,
    label: "CRM",
    items: [
      {
        id: "leads",
        title: "Leads",
        url: "/leads",
        icon: ChartBar,
      },
      {
        id: "campaigns",
        title: "Campaigns",
        url: "/campaigns",
        icon: Megaphone,
      },
    ],
  },
];
