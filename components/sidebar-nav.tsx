"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BriefcaseBusiness, CircleUserRound, FileText, LayoutDashboard, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/service-history", label: "Service History", icon: BriefcaseBusiness },
  { href: "/claims", label: "Claims", icon: FileText },
  { href: "/passbook", label: "Passbook", icon: BookOpen },
  { href: "/nomination", label: "Nomination", icon: Users },
  { href: "/profile", label: "Profile", icon: CircleUserRound },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Member navigation" className="space-y-1 p-3">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href === "/claims" && pathname.startsWith("/claims/"));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-navy text-white" : "text-slate-600 hover:bg-slate-100 hover:text-navy",
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
