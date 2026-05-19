import { mockOrders } from "@/lib/mock-orders";
import { notFound } from "next/navigation";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = mockOrders.find((o) => o.id === id);

  if (!order) notFound();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-brand">Detalle de orden</h1>
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Folio:</span> {order.id}
        </p>
        <p>
          <span className="font-medium">Estado:</span> {order.status}
        </p>
        <p>
          <span className="font-medium">Cliente:</span> {order.customer}
        </p>
        <p>
          <span className="font-medium">Tipo de cuchilla / Servicio:</span>{" "}
          {order.product}
        </p>
        <p>
          <span className="font-medium">Entrega estimada:</span>{" "}
          {order.deliveryTime}
        </p>
      </div>
    </div>
  );
}
