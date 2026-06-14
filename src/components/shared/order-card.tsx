import Link from "next/link";
import { Folio } from "@/components/shared/folio";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/format";
import type { Order } from "@/lib/mock-data/types";

interface OrderCardProps {
  order: Order;
  customerName: string;
  serviceName: string;
}

export function OrderCard({ order, customerName, serviceName }: OrderCardProps) {
  return (
    <Link href={`/ordenes/${order.folio}`} className="block">
      <div className="group flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3.5 transition-colors hover:border-gold active:scale-95 transition-transform">
        <div className="flex items-center justify-between gap-2">
          <Folio folio={order.folio} className="text-xs text-muted-foreground" />
          <StatusBadge status={order.status} />
        </div>
        <span className="font-semibold leading-tight">{customerName}</span>
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>{serviceName}</span>
          <span aria-hidden="true">·</span>
          <span>
            {order.status === "DELIVERED" && order.deliveredAt
              ? `Entregada ${formatDateTime(order.deliveredAt)}`
              : `Entrega ${formatDateTime(order.estimatedDelivery)}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
