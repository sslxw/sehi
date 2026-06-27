import {
  Calendar,
  BookOpen,
  Building2,
  HeartPulse,
  Home,
  MessageCircle,
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  mobile?: boolean;
}

export const navItems: NavItem[] = [
  { href: "/", icon: Home, labelKey: "nav.today", mobile: true },
  { href: "/food", icon: UtensilsCrossed, labelKey: "nav.food", mobile: true },
  { href: "/health", icon: HeartPulse, labelKey: "nav.health", mobile: true },
  { href: "/journal", icon: BookOpen, labelKey: "nav.journal", mobile: true },
  { href: "/calendar", icon: Calendar, labelKey: "nav.calendar", mobile: false },
  { href: "/coach", icon: MessageCircle, labelKey: "nav.coach", mobile: true },
  { href: "/enterprise", icon: Building2, labelKey: "nav.enterprise", mobile: false },
  { href: "/trends", icon: TrendingUp, labelKey: "nav.trends", mobile: true },
];

export const mobileNavItems = navItems.filter((item) => item.mobile);

export const enterpriseNavItems = [
  { href: "/enterprise", labelKey: "nav.overview" },
  { href: "/enterprise/team", labelKey: "nav.team" },
];
