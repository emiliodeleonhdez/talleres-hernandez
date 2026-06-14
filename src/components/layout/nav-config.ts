import {
  BanknoteIcon,
  BookOpenIcon,
  HomeIcon,
  PackageIcon,
  ScrollTextIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavSection {
  label: string;
  href: string;
  icon: LucideIcon;
  superadminOnly?: boolean;
}

export const NAV_SECTIONS: NavSection[] = [
  { label: "Dashboard", href: "/", icon: HomeIcon },
  { label: "Órdenes", href: "/ordenes", icon: ScrollTextIcon },
  { label: "Clientes", href: "/clientes", icon: UsersIcon },
  { label: "Inventario", href: "/inventario", icon: PackageIcon },
  { label: "Caja", href: "/caja", icon: BanknoteIcon },
  { label: "Catálogo", href: "/catalogo", icon: BookOpenIcon },
  { label: "Usuarios", href: "/usuarios", icon: UserCogIcon, superadminOnly: true },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
