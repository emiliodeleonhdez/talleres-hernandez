"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BanknoteIcon,
  FileTextIcon,
  MessageSquarePlusIcon,
  PackageIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DeliveryDialog } from "@/components/ordenes/delivery-dialog";
import { OrderStepper } from "@/components/ordenes/order-stepper";
import { PaymentDialog } from "@/components/ordenes/payment-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Folio } from "@/components/shared/folio";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, formatMoney, getInitials } from "@/lib/format";
import {
  getOrderBalance,
  getOrderGrandTotal,
  getOrderPaidAmount,
  getOrderPayments,
  getOrderProducts,
  useMockData,
} from "@/lib/mock-data/store";
import type { InvoiceStatus } from "@/lib/mock-data/types";
import {
  INVOICE_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_TYPE_LABELS,
  REGLAS_STATUS_LABELS,
} from "@/lib/mock-data/types";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const store = useMockData();
  const {
    orders,
    customers,
    bladeTypes,
    services,
    users,
    orderProducts,
    invoiceData,
    payments,
    orderComments,
    orderStatusLogs,
    updateOrderStatus,
    addOrderComment,
    setInvoiceStatus,
    isSuperadmin,
  } = store;

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [comment, setComment] = useState("");

  const order = orders.find((o) => o.folio === params.id);

  if (!order) {
    return (
      <div className="p-6">
        <EmptyState
          icon={FileTextIcon}
          title="Orden no encontrada"
          description={`No existe una orden con folio ${params.id}.`}
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/ordenes">
                <ArrowLeftIcon className="size-4" /> Volver a órdenes
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const customer = customers.find((c) => c.id === order.customerId);
  const bladeType = bladeTypes.find((b) => b.id === order.bladeTypeId);
  const service = services.find((s) => s.id === order.serviceId);
  const receivedBy = users.find((u) => u.id === order.receivedById);
  const invoice = invoiceData.find((i) => i.orderId === order.id);
  const products = getOrderProducts(orderProducts, order.id);
  const orderPayments = getOrderPayments(payments, order.id);
  const grandTotal = getOrderGrandTotal(order, orderProducts);
  const paid = getOrderPaidAmount(payments, order.id);
  const balance = getOrderBalance(order, orderProducts, payments);
  const productsTotal = products.reduce((sum, p) => sum + p.subtotal, 0);

  const comments = orderComments
    .filter((c) => c.orderId === order.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const logs = orderStatusLogs
    .filter((l) => l.orderId === order.id)
    .sort((a, b) => b.changedAt.localeCompare(a.changedAt));

  const userName = (id: string) =>
    users.find((u) => u.id === id)?.fullName ?? "—";

  function handleTransition() {
    if (!order) return;
    if (order.status === "RECEIVED") {
      const result = updateOrderStatus(order.id, "PENDING_ADVANCE");
      if (!result.ok) toast.error(result.error);
      else toast.success("Orden en espera de anticipo");
    } else if (order.status === "PENDING_ADVANCE") {
      setPaymentOpen(true);
    } else if (order.status === "IN_PROGRESS") {
      const result = updateOrderStatus(order.id, "READY");
      if (!result.ok) toast.error(result.error);
      else toast.success("Orden lista para entrega");
    } else if (order.status === "READY") {
      setDeliveryOpen(true);
    }
  }

  const transitionLabel: Partial<Record<typeof order.status, string>> = {
    RECEIVED: "Pasar a pendiente de anticipo",
    PENDING_ADVANCE: "Registrar anticipo",
    IN_PROGRESS: "Marcar como lista",
    READY: "Entregar",
  };

  function handleAddComment() {
    if (!order || !comment.trim()) return;
    addOrderComment(order.id, comment.trim());
    setComment("");
    toast.success("Comentario agregado");
  }

  const isClosed = order.status === "DELIVERED" || order.status === "CANCELLED";

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <Link
            href="/ordenes"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" /> Órdenes
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-brand">
              <Folio folio={order.folio} />
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <div className="filo-edge w-16" aria-hidden="true" />
        </div>
        <div className="flex items-center gap-2">
          {!isClosed && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-cancelled-fg">
                  <XIcon className="size-4" /> Cancelar orden
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cancelar la orden?</AlertDialogTitle>
                  <AlertDialogDescription>
                    La orden {order.folio} pasará a estado Cancelada. Esta
                    acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Volver</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const result = updateOrderStatus(order.id, "CANCELLED");
                      if (!result.ok) toast.error(result.error);
                      else toast.success("Orden cancelada");
                    }}
                  >
                    Cancelar orden
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {transitionLabel[order.status] && (
            <Button
              onClick={handleTransition}
              className="bg-brand hover:bg-brand/90"
            >
              {transitionLabel[order.status]}
              <ArrowRightIcon className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="px-4 py-2 sm:px-6">
          <OrderStepper order={order} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Detalle */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base text-brand">
                Detalle
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Cliente</span>
                {customer ? (
                  <Link
                    href={`/clientes/${customer.id}`}
                    className="font-medium text-brand hover:underline"
                  >
                    {customer.name}
                  </Link>
                ) : (
                  <span>—</span>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Teléfono</span>
                <span>{customer?.phone ?? "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  Tipo de cuchilla
                </span>
                <span>{bladeType?.name ?? "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Servicio</span>
                <span>{service?.name ?? "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  Dejó la cuchilla
                </span>
                <span>{order.droppedOffBy}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  Entrega estimada
                </span>
                <span>{formatDateTime(order.estimatedDelivery)}</span>
              </div>
              {order.deliveredAt && (
                <>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      Recogió
                    </span>
                    <span>
                      {order.pickedUpBy}
                      {order.pickedUpPhone ? ` · ${order.pickedUpPhone}` : ""}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      Entregada
                    </span>
                    <span>{formatDateTime(order.deliveredAt)}</span>
                  </div>
                </>
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Recibió</span>
                <span>{receivedBy?.fullName ?? "—"}</span>
              </div>
              {order.notes && (
                <div className="flex flex-col gap-0.5 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">Notas</span>
                  <span className="text-muted-foreground">{order.notes}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cobro y pagos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-base text-brand">
                Cobro
              </CardTitle>
              {!isClosed && balance > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPaymentOpen(true)}
                >
                  <BanknoteIcon className="size-4" /> Registrar pago
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Servicio (subtotal)
                  </span>
                  <span className="font-mono">{formatMoney(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA (16%)</span>
                  <span className="font-mono">
                    {formatMoney(order.ivaAmount)}
                  </span>
                </div>
                {productsTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Regletas</span>
                    <span className="font-mono">
                      {formatMoney(productsTotal)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="font-mono">{formatMoney(grandTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pagado</span>
                  <span className="font-mono text-delivered-fg">
                    {formatMoney(paid)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Saldo</span>
                  <span
                    className={
                      balance > 0
                        ? "font-mono text-fofo"
                        : "font-mono text-delivered-fg"
                    }
                  >
                    {formatMoney(balance)}
                  </span>
                </div>
              </div>
              {orderPayments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    {orderPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {PAYMENT_TYPE_LABELS[payment.type]} ·{" "}
                            {PAYMENT_METHOD_LABELS[payment.method]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(payment.paidAt)} ·{" "}
                            {userName(payment.registeredById)}
                          </span>
                        </div>
                        <span className="font-mono font-medium">
                          {formatMoney(payment.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Regletas */}
          {products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-base text-brand">
                  <PackageIcon className="size-4 text-gold" /> Regletas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {products.map((op) => {
                  const product = store.products.find(
                    (p) => p.id === op.productId,
                  );
                  return (
                    <div
                      key={op.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {op.quantity} × {product?.name ?? "Regleta"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatMoney(op.unitPrice)} c/u
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-sub-nav-border text-muted-foreground"
                        >
                          {REGLAS_STATUS_LABELS[op.status]}
                        </Badge>
                        <span className="font-mono">
                          {formatMoney(op.subtotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Factura */}
          {order.requiresInvoice && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-heading text-base text-brand">
                  <FileTextIcon className="size-4 text-gold" /> Factura
                </CardTitle>
                <Select
                  value={order.invoiceStatus}
                  onValueChange={(v) =>
                    setInvoiceStatus(order.id, v as InvoiceStatus)
                  }
                  disabled={!isSuperadmin}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end">
                    <SelectItem value="PENDING">
                      {INVOICE_STATUS_LABELS.PENDING}
                    </SelectItem>
                    <SelectItem value="ISSUED">
                      {INVOICE_STATUS_LABELS.ISSUED}
                    </SelectItem>
                    <SelectItem value="CANCELLED">
                      {INVOICE_STATUS_LABELS.CANCELLED}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">RFC</span>
                  <span className="font-mono">{invoice?.rfc ?? "—"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    Razón social
                  </span>
                  <span>{invoice?.razonSocial ?? "—"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Uso CFDI</span>
                  <span className="font-mono">{invoice?.cfdiUse ?? "—"}</span>
                </div>
                {invoice?.fiscalAddress && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      Domicilio fiscal
                    </span>
                    <span>{invoice.fiscalAddress}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna derecha: bitácora */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base text-brand">
                Bitácora de la cuchilla
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Agregar comentario..."
                  rows={2}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="self-end"
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                >
                  <MessageSquarePlusIcon className="size-4" /> Comentar
                </Button>
              </div>
              {comments.length === 0 ? (
                <p className="py-2 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Sin comentarios
                </p>
              ) : (
                <ScrollArea className="max-h-96">
                  <div className="space-y-3 pr-3">
                    {comments.map((c) => (
                      <div key={c.id} className="flex gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sub-nav-bg text-2xs font-semibold text-brand">
                          {getInitials(userName(c.authorId))}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm leading-snug">{c.content}</p>
                          <span className="text-xs text-muted-foreground">
                            {userName(c.authorId)} ·{" "}
                            {formatDateTime(c.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base text-brand">
                Historial de estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="py-2 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Sin cambios registrados
                </p>
              ) : (
                <ol className="space-y-3">
                  {logs.map((log) => (
                    <li key={log.id} className="flex gap-2.5">
                      <div className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm">
                          {ORDER_STATUS_LABELS[log.prevStatus]} →{" "}
                          <span className="font-medium">
                            {ORDER_STATUS_LABELS[log.newStatus]}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {userName(log.changedById)} ·{" "}
                          {formatDateTime(log.changedAt)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentDialog
        order={order}
        suggestedType={order.advancePaid ? "FINAL" : "ADVANCE"}
        suggestedAmount={order.advancePaid ? balance : order.advanceAmount}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
      />
      <DeliveryDialog
        order={order}
        balance={balance}
        open={deliveryOpen}
        onOpenChange={setDeliveryOpen}
      />
    </div>
  );
}
