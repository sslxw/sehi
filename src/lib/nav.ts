import {
  Calendar,
  BookOpen,
  Building2,
  Home,
  MessageCircle,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export const navItems: { href: string; icon: LucideIcon; label: string }[] = [
  { href: "/", icon: Home, label: "Today" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/coach", icon: MessageCircle, label: "Coach" },
  { href: "/enterprise", icon: Building2, label: "Enterprise" },
  { href: "/trends", icon: TrendingUp, label: "Trends" },
];

export const enterpriseNavItems = [
  { href: "/enterprise", label: "Overview" },
  { href: "/enterprise/team", label: "Team" },
];
