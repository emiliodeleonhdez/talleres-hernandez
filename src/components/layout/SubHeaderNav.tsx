"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMockData } from "@/lib/mock-data/store";
import { cn } from "@/lib/utils";
import { isNavActive, NAV_SECTIONS } from "./nav-config";

function Chip({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 pointer-events-none h-8 p-2",
        active
          ? "bg-fofo border-transparent text-white"
          : "border-sub-nav-border bg-transparent text-muted-foreground",
      )}
    >
      <span className="shrink-0 flex items-center">
        <Icon className="size-4" />
      </span>
      {label}
    </Badge>
  );
}

export function SubHeaderNav() {
  const pathname = usePathname();
  const { isSuperadmin } = useMockData();

  const sections = NAV_SECTIONS.filter(
    (s) => !s.superadminOnly || isSuperadmin,
  );

  return (
    <nav
      data-slot="sub-header-nav"
      className="md:hidden sticky top-14 z-30 flex shrink-0 items-center gap-2 overflow-x-auto border-b border-sub-nav-border bg-sub-nav-bg px-3 py-2 no-scrollbar scroll-smooth"
    >
      {sections.map((section) => (
        <Link key={section.href} href={section.href} className="shrink-0">
          <Chip
            icon={section.icon}
            label={section.label}
            active={isNavActive(pathname, section.href)}
          />
        </Link>
      ))}
    </nav>
  );
}
