"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

export function NavItem({ href, icon: Icon, label }: NavItemProps) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={cn(
        "h-full flex flex-col items-center justify-center gap-1 px-4 border-t-2",
        pathname === href ? "border-t-fofo" : "border-t-transparent",
      )}
    >
      <Icon
        className={cn(
          "size-5",
          pathname === href ? "text-fofo" : "text-foreground",
        )}
      />
      <span
        className={cn(
          "text-xs text-fofo",
          pathname === href ? "text-fofo" : "text-foreground",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
