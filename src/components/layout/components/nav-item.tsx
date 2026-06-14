"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { isNavActive } from "../nav-config";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

export function NavItem({ href, icon: Icon, label }: NavItemProps) {
  const pathname = usePathname();
  const active = isNavActive(pathname, href);

  return (
    <Link
      href={href}
      className={cn(
        "h-full flex flex-col items-center justify-center gap-1 px-4 border-t-2 transition-colors",
        active ? "border-t-gold" : "border-t-transparent",
      )}
    >
      <Icon
        className={cn("size-5", active ? "text-brand" : "text-muted-foreground")}
      />
      <span
        className={cn(
          "text-xs",
          active ? "font-medium text-brand" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
