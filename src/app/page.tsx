"use client";

import {
  BanknoteIcon,
  CheckCircleIcon,
  ClockIcon,
  PackageCheckIcon,
  PlusIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NewOrderDialog } from "@/components/ordenes/new-order-dialog";
import { OrderList } from "@/components/shared/order-list";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { formatLongDate, formatMoney, isToday } from "@/lib/format";
import { getCashBalance, isLowStock, useMockData } from "@/lib/mock-data/store";

export default function Home() {
  const { orders, cashMovements, materials, currentUser } = useMockData();
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const activeOrders = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED",
  );
  const inProgress = orders.filter((o) => o.status === "IN_PROGRESS");
  const ready = orders.filter((o) => o.status === "READY");
  const deliveredToday = orders.filter(
    (o) => o.status === "DELIVERED" && o.deliveredAt && isToday(o.deliveredAt),
  );
  const cashBalance = getCashBalance(cashMovements);
  const todayIn = cashMovements
    .filter((m) => m.type === "IN" && isToday(m.createdAt))
    .reduce((sum, m) => sum + m.amount, 0);
  const lowStockCount = materials.filter(
    (m) => m.active && isLowStock(m),
  ).length;

  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  const firstName = currentUser.fullName.split(" ")[0];

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-brand">
            Buen día, {firstName}
          </h1>
          <div className="filo-edge w-16" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            {formatLongDate(new Date())} · {activeOrders.length} órdenes activas
          </p>
        </div>
        <Button
          onClick={() => setNewOrderOpen(true)}
          className="bg-brand hover:bg-brand/90"
        >
          <PlusIcon className="size-4" /> Nueva orden
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <StatCard
          label="En proceso"
          value={inProgress.length}
          icon={ClockIcon}
        />
        <StatCard
          label="Listas p/entrega"
          value={ready.length}
          icon={PackageCheckIcon}
        />
        <StatCard
          label="Entregadas hoy"
          value={deliveredToday.length}
          icon={CheckCircleIcon}
        />
        <StatCard
          label="Caja"
          value={formatMoney(cashBalance)}
          icon={BanknoteIcon}
          hint={`Hoy entraron ${formatMoney(todayIn)}`}
        />
      </div>

      {lowStockCount > 0 && (
        <Link
          href="/inventario"
          className="flex items-center gap-2 rounded-lg border border-pending-fg/30 bg-pending px-4 py-3 text-sm text-pending-fg transition-colors hover:bg-pending/70"
        >
          <TriangleAlertIcon className="size-4 shrink-0" />
          <span>
            <span className="font-semibold">{lowStockCount}</span>{" "}
            {lowStockCount === 1
              ? "material por debajo del mínimo"
              : "materiales por debajo del mínimo"}{" "}
            — revisar inventario
          </span>
        </Link>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-brand">
            Órdenes recientes
          </h2>
          <Link
            href="/ordenes"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Ver todas
          </Link>
        </div>
        <OrderList orders={recentOrders} />
      </div>

      <NewOrderDialog open={newOrderOpen} onOpenChange={setNewOrderOpen} />
    </div>
  );
}
