"use client";

import { useState } from "react";
import { ScrollTextIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderCard } from "@/components/shared/order-card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMockData } from "@/lib/mock-data/store";
import type { Order, OrderStatus } from "@/lib/mock-data/types";
import { ORDER_STATUS_LABELS } from "@/lib/mock-data/types";

type FilterValue = OrderStatus | "todas";

const filters: { value: FilterValue; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "RECEIVED", label: ORDER_STATUS_LABELS.RECEIVED },
  { value: "PENDING_ADVANCE", label: ORDER_STATUS_LABELS.PENDING_ADVANCE },
  { value: "IN_PROGRESS", label: ORDER_STATUS_LABELS.IN_PROGRESS },
  { value: "READY", label: ORDER_STATUS_LABELS.READY },
  { value: "DELIVERED", label: ORDER_STATUS_LABELS.DELIVERED },
  { value: "CANCELLED", label: ORDER_STATUS_LABELS.CANCELLED },
];

// Literal class strings so Tailwind picks them up at build time.
const activeClass: Record<FilterValue, string> = {
  todas:
    "data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:border-transparent",
  RECEIVED:
    "data-[state=on]:bg-received data-[state=on]:text-received-fg data-[state=on]:border-transparent",
  PENDING_ADVANCE:
    "data-[state=on]:bg-pending data-[state=on]:text-pending-fg data-[state=on]:border-transparent",
  IN_PROGRESS:
    "data-[state=on]:bg-warning data-[state=on]:text-fofo data-[state=on]:border-transparent",
  READY:
    "data-[state=on]:bg-ready data-[state=on]:text-brand data-[state=on]:border-transparent",
  DELIVERED:
    "data-[state=on]:bg-delivered data-[state=on]:text-delivered-fg data-[state=on]:border-transparent",
  CANCELLED:
    "data-[state=on]:bg-cancelled data-[state=on]:text-cancelled-fg data-[state=on]:border-transparent",
};

interface OrderListProps {
  orders: Order[];
}

export function OrderList({ orders }: OrderListProps) {
  const { customers, services } = useMockData();
  const [active, setActive] = useState<FilterValue>("todas");

  const filtered =
    active === "todas" ? orders : orders.filter((o) => o.status === active);

  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        type="single"
        value={active}
        onValueChange={(val) => {
          if (val) setActive(val as FilterValue);
        }}
        className="overflow-x-auto pb-2 w-full justify-start no-scrollbar"
      >
        {filters.map((f) => (
          <ToggleGroupItem
            key={f.value}
            value={f.value}
            variant="outline"
            size="sm"
            className={`shrink-0 rounded-full text-muted-foreground ${activeClass[f.value]}`}
          >
            {f.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {filtered.length === 0 ? (
        <EmptyState
          icon={ScrollTextIcon}
          title="Sin órdenes"
          description="No hay órdenes con este estado."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              customerName={
                customers.find((c) => c.id === order.customerId)?.name ??
                "Cliente desconocido"
              }
              serviceName={
                services.find((s) => s.id === order.serviceId)?.name ??
                "Servicio"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
