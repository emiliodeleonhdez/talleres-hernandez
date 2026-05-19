import { OrderList } from "@/components/shared/order-list";
import { StatCard } from "@/components/shared/stat-card";
import { mockOrders } from "@/lib/mock-orders";
import { CheckCircle, Clock, Package, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-brand">Buen día, Rafa</h1>
        <p className="text-muted-foreground text-sm leading-none">
          Lunes, 5 de mayo · 14 órdenes activas
        </p>
      </div>
      <div className="flex flex-wrap gap-2 *:basis-[calc(50%-4px)]">
        <StatCard label="Activas" value={14} icon={ShieldCheck} />
        <StatCard label="En proceso" value={6} icon={Clock} />
        <StatCard label="Listas para entregar" value={4} icon={Package} />
        <StatCard label="Entregadas hoy" value={14} icon={CheckCircle} />
      </div>
      <div className="md:hidden">
        <OrderList orders={mockOrders} />
      </div>
    </div>
  );
}
