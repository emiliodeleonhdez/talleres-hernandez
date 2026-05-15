"use client";
import { BanknoteIcon, HomeIcon, PackageIcon, ShoppingCartIcon, UsersIcon } from "lucide-react";
import { NavItem } from "./components/nav-item";

export function AppFooter() {
  return (
    <footer
      data-slot="app-footer"
      className="flex md:hidden h-14 shrink-0 items-center justify-around bg-background"
    >
      <NavItem href="/" icon={HomeIcon} label="Inicio" />
      <NavItem href="/clientes" icon={UsersIcon} label="Clientes" />
      <NavItem href="/ordenes" icon={ShoppingCartIcon} label="Órdenes" />
      <NavItem href="/inventario" icon={PackageIcon} label="Inventario" />
      <NavItem href="/caja" icon={BanknoteIcon} label="Caja" />
    </footer>
  );
}
