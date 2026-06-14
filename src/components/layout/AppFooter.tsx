"use client";
import {
  BanknoteIcon,
  HomeIcon,
  PlusIcon,
  ScrollTextIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { NewOrderDialog } from "@/components/ordenes/new-order-dialog";
import { NavItem } from "./components/nav-item";

export function AppFooter() {
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);

  return (
    <footer
      data-slot="app-footer"
      className="flex md:hidden h-16 shrink-0 items-stretch justify-around border-t border-border bg-background"
    >
      <NavItem href="/" icon={HomeIcon} label="Inicio" />
      <NavItem href="/ordenes" icon={ScrollTextIcon} label="Órdenes" />
      <button
        onClick={() => setIsNewOrderDialogOpen(true)}
        className="flex cursor-pointer flex-col items-center justify-center px-2"
        aria-label="Nueva orden"
      >
        <span className="flex size-11 -translate-y-3 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform active:scale-95">
          <PlusIcon className="size-5" />
        </span>
      </button>
      <NavItem href="/clientes" icon={UsersIcon} label="Clientes" />
      <NavItem href="/caja" icon={BanknoteIcon} label="Caja" />
      <NewOrderDialog
        open={isNewOrderDialogOpen}
        onOpenChange={setIsNewOrderDialogOpen}
      />
    </footer>
  );
}
