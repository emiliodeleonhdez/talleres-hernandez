"use client";
import {
  BanknoteIcon,
  HomeIcon,
  PackageIcon,
  UsersIcon,
} from "lucide-react";
import { NavItem } from "./components/nav-item";
import { useState } from "react";
import { OrderDialog } from "@/components/ordenes/order-dialog";

export function AppFooter() {
  const [isNewOrderDialogOpen, setisNewOrderDialogOpen] = useState(false);

  return (
    <footer
      data-slot="app-footer"
      className="flex md:hidden h-14 shrink-0 items-center justify-around bg-background"
    >
      <NavItem href="/" icon={HomeIcon} label="Inicio" />
      <NavItem href="/clientes" icon={UsersIcon} label="Clientes" />
      <OrderDialog
        open={isNewOrderDialogOpen}
        onOpenChange={setisNewOrderDialogOpen}
      />
      <NavItem href="/inventario" icon={PackageIcon} label="Inventario" />
      <NavItem href="/caja" icon={BanknoteIcon} label="Caja" />
    </footer>
  );
}
