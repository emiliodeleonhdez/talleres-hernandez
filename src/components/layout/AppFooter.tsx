"use client";
import {
  BanknoteIcon,
  HomeIcon,
  PackageIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import { NavItem } from "./components/nav-item";
import { NavAction } from "./components/nav-action";

export function AppFooter() {
  return (
    <footer
      data-slot="app-footer"
      className="flex md:hidden h-14 shrink-0 items-center justify-around bg-background"
    >
      <NavItem href="/" icon={HomeIcon} label="Inicio" />
      <NavItem href="/clientes" icon={UsersIcon} label="Clientes" />
      <NavAction
        icon={PlusIcon}
        label="Nueva Orden"
        props={{ variant: "ghost" }}
      />
      <NavItem href="/inventario" icon={PackageIcon} label="Inventario" />
      <NavItem href="/caja" icon={BanknoteIcon} label="Caja" />
    </footer>
  );
}
