"use client";

import { PlusIcon, ScrollTextIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NewOrderDialog } from "@/components/ordenes/new-order-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Folio } from "@/components/shared/folio";
import { OrderCard } from "@/components/shared/order-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatDateTime, formatMoney } from "@/lib/format";
import { getOrderGrandTotal, useMockData } from "@/lib/mock-data/store";
import type { OrderStatus } from "@/lib/mock-data/types";
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

export default function OrdersPage() {
  const router = useRouter();
  const { orders, customers, services, orderProducts } = useMockData();
  const [statusFilter, setStatusFilter] = useState<FilterValue>("todas");
  const [search, setSearch] = useState("");
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const customerName = (id: string) =>
    customers.find((c) => c.id === id)?.name ?? "Cliente desconocido";
  const serviceName = (id: string) =>
    services.find((s) => s.id === id)?.name ?? "Servicio";

  const term = search.trim().toLowerCase();
  const filtered = orders
    .filter((o) => statusFilter === "todas" || o.status === statusFilter)
    .filter(
      (o) =>
        !term ||
        o.folio.toLowerCase().includes(term) ||
        customerName(o.customerId).toLowerCase().includes(term),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Órdenes"
        subtitle={`${orders.length} órdenes registradas`}
        actions={
          <Button
            onClick={() => setNewOrderOpen(true)}
            className="bg-brand hover:bg-brand/90"
          >
            <PlusIcon className="size-4" /> Nueva orden
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por folio o cliente..."
            className="pl-8"
          />
        </div>
        <ToggleGroup
          type="single"
          value={statusFilter}
          onValueChange={(val) => {
            if (val) setStatusFilter(val as FilterValue);
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
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ScrollTextIcon}
          title="Sin órdenes"
          description="No hay órdenes que coincidan con la búsqueda o el filtro."
          action={
            <Button variant="outline" size="sm" onClick={() => setNewOrderOpen(true)}>
              <PlusIcon className="size-4" /> Crear orden
            </Button>
          }
        />
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                customerName={customerName(order.customerId)}
                serviceName={serviceName(order.serviceId)}
              />
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden rounded-lg border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow
                    key={order.id}
                    onClick={() => router.push(`/ordenes/${order.folio}`)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <Folio folio={order.folio} className="text-sm" />
                    </TableCell>
                    <TableCell className="font-medium">
                      {customerName(order.customerId)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {serviceName(order.serviceId)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.status === "DELIVERED" && order.deliveredAt
                        ? formatDateTime(order.deliveredAt)
                        : formatDateTime(order.estimatedDelivery)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatMoney(getOrderGrandTotal(order, orderProducts))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <NewOrderDialog open={newOrderOpen} onOpenChange={setNewOrderOpen} />
    </div>
  );
}
