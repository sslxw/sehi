import {
  Calendar,
  BookOpen,
  Building2,
  ClipboardList,
  Dumbbell,
  HeartPulse,
  Home,
  LayoutGrid,
  MessageCircle,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  labelKey: string;
}

export const navItems: NavItem[] = [
  { href: "/", icon: Home, labelKey: "nav.today" },
  { href: "/food", icon: UtensilsCrossed, labelKey: "nav.food" },
  { href: "/workouts", icon: Dumbbell, labelKey: "nav.workouts" },
  { href: "/check-in", icon: ClipboardList, labelKey: "nav.checkIn" },
  { href: "/health", icon: HeartPulse, labelKey: "nav.health" },
  { href: "/journal", icon: BookOpen, labelKey: "nav.journal" },
  { href: "/calendar", icon: Calendar, labelKey: "nav.calendar" },
  { href: "/review", icon: Sparkles, labelKey: "nav.review" },
  { href: "/coach", icon: MessageCircle, labelKey: "nav.coach" },
  { href: "/enterprise", icon: Building2, labelKey: "nav.enterprise" },
  { href: "/trends", icon: TrendingUp, labelKey: "nav.trends" },
];

/** Bottom bar — keep to 4 items + More sheet */
export const primaryMobileNav: NavItem[] = [
  { href: "/", icon: Home, labelKey: "nav.today" },
  { href: "/food", icon: UtensilsCrossed, labelKey: "nav.food" },
  { href: "/coach", icon: MessageCircle, labelKey: "nav.coach" },
];

export const moreNavItems: NavItem[] = [
  { href: "/workouts", icon: Dumbbell, labelKey: "nav.workouts" },
  { href: "/check-in", icon: ClipboardList, labelKey: "nav.checkIn" },
  { href: "/trends", icon: TrendingUp, labelKey: "nav.trends" },
  { href: "/health", icon: HeartPulse, labelKey: "nav.health" },
  { href: "/journal", icon: BookOpen, labelKey: "nav.journal" },
  { href: "/calendar", icon: Calendar, labelKey: "nav.calendar" },
  { href: "/review", icon: Sparkles, labelKey: "nav.review" },
  { href: "/enterprise", icon: Building2, labelKey: "nav.enterprise" },
];

export const moreNavTrigger: NavItem = {
  href: "#more",
  icon: LayoutGrid,
  labelKey: "nav.more",
};

export const enterpriseNavItems = [
  { href: "/enterprise", labelKey: "nav.overview" },
  { href: "/enterprise/team", labelKey: "nav.team" },
];

export function isMoreNavActive(pathname: string): boolean {
  return moreNavItems.some((item) =>
    item.href === "/enterprise" ? pathname.startsWith("/enterprise") : pathname === item.href
  );
}
