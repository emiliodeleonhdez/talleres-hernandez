"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { OrderCard, type OrderStatus } from "./order-card";

type FilterValue = OrderStatus | "todas";

const filters: {
  value: FilterValue;
  label: string;
  activeBg: string;
  activeFg: string;
}[] = [
  {
    value: "todas",
    label: "Todas",
    activeBg: "bg-brand",
    activeFg: "text-white",
  },
  {
    value: "en-proceso",
    label: "En proceso",
    activeBg: "bg-warning",
    activeFg: "text-fofo",
  },
  {
    value: "listo",
    label: "Listo p/ entrega",
    activeBg: "bg-ready",
    activeFg: "text-brand",
  },
  {
    value: "recibido",
    label: "Recibido",
    activeBg: "bg-received",
    activeFg: "text-received-fg",
  },
  {
    value: "entregada",
    label: "Entregada",
    activeBg: "bg-delivered",
    activeFg: "text-delivered-fg",
  },
];

export interface Order {
  id: string;
  status: OrderStatus;
  customer: string;
  product: string;
  deliveryTime: string;
}

interface OrderListProps {
  orders: Order[];
}

export function OrderList({ orders }: OrderListProps) {
  const [active, setActive] = useState<FilterValue>("todas");

  const filtered =
    active === "todas" ? orders : orders.filter((o) => o.status === active);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => {
          const isActive = active === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onPointerDown={() => setActive(f.value)}
              className={cn(
                "inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors touch-manipulation select-none cursor-pointer",
                isActive
                  ? `${f.activeBg} ${f.activeFg} border-transparent`
                  : "border-border text-muted-foreground bg-transparent",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 h-90 overflow-auto pr-2">
        {filtered.map((order) => (
          <OrderCard key={order.id} {...order} />
        ))}
      </div>
    </div>
  );
}
