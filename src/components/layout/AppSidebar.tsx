"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/format";
import { useMockData } from "@/lib/mock-data/store";
import { ROLE_LABELS } from "@/lib/mock-data/types";
import { cn } from "@/lib/utils";
import { isNavActive, NAV_SECTIONS } from "./nav-config";

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser, isSuperadmin } = useMockData();

  const sections = NAV_SECTIONS.filter(
    (s) => !s.superadminOnly || isSuperadmin,
  );

  return (
    <Sidebar className="hidden md:flex" data-slot="app-sidebar">
      <SidebarHeader className="px-4 pt-5 pb-3">
        <Link href="/" className="flex flex-col gap-1.5">
          <span className="font-heading text-xl font-bold tracking-tight text-sidebar-foreground">
            FiloGes
          </span>
          <div className="filo-edge w-14" aria-hidden="true" />
          <span className="font-mono text-2xs uppercase tracking-widest text-sidebar-foreground/60">
            Talleres Hernández
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            Operación
          </SidebarGroupLabel>
          <SidebarMenu>
            {sections.map((section) => {
              const active = isNavActive(pathname, section.href);
              return (
                <SidebarMenuItem key={section.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    className={cn(
                      "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
                    )}
                  >
                    <Link href={section.href}>
                      <section.icon
                        className={cn("size-4", active && "text-gold")}
                      />
                      <span>{section.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback className="bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
              {getInitials(currentUser.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {currentUser.fullName}
            </span>
            <span className="font-mono text-2xs uppercase tracking-widest text-sidebar-foreground/60">
              {ROLE_LABELS[currentUser.role]}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
