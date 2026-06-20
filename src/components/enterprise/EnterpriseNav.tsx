"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/enterprise", label: "Overview", icon: Building2, exact: true },
  { href: "/enterprise/team", label: "Team", icon: Users, exact: false },
];

export function EnterpriseNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
              isActive
                ? "bg-white/10 border-white/20 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
