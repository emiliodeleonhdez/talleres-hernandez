import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export type OrderStatus = "en-proceso" | "listo" | "recibido" | "entregada";

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; fg: string; dot: string }
> = {
  "en-proceso": {
    label: "En proceso",
    bg: "bg-warning",
    fg: "text-fofo",
    dot: "bg-fofo",
  },
  listo: {
    label: "Listo p/ entrega",
    bg: "bg-ready",
    fg: "text-brand",
    dot: "bg-brand",
  },
  recibido: {
    label: "Recibido",
    bg: "bg-received",
    fg: "text-received-fg",
    dot: "bg-received-fg",
  },
  entregada: {
    label: "Entregada",
    bg: "bg-delivered",
    fg: "text-delivered-fg",
    dot: "bg-delivered-fg",
  },
};

interface OrderCardProps {
  id: string;
  status: OrderStatus;
  customer: string;
  product: string;
  deliveryTime: string;
}

export function OrderCard({
  id,
  status,
  customer,
  product,
  deliveryTime,
}: OrderCardProps) {
  const { label, bg, fg, dot } = statusConfig[status];

  return (
    <Link href={`/ordenes/${id}`} className="h-25 block">
      <div className="flex flex-col justify-between p-3.5 bg-white rounded-lg w-full h-full border border-gray-500">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">{id}</span>
          <Badge
            variant="outline"
            className={`${bg} ${fg} border-transparent flex gap-1 items-center`}
          >
            <div className={`size-2 rounded-full ${dot}`} />
            <span>{label}</span>
          </Badge>
        </div>
        <span className="font-semibold">{customer}</span>
        <div className="flex gap-3 text-xs">
          <span className="text-muted-foreground">{product}</span>
          <span>-</span>
          <span className="text-muted-foreground">
            Entrega a las {deliveryTime}
          </span>
        </div>
      </div>
    </Link>
  );
}
