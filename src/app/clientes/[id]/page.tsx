"use client";

import {
  ArrowLeftIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  ScrollTextIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CustomerDialog } from "@/components/clientes/customer-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderCard } from "@/components/shared/order-card";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate, getInitials } from "@/lib/format";
import { useMockData } from "@/lib/mock-data/store";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { customers, orders, services, isSuperadmin, deleteCustomer } =
    useMockData();
  const [editOpen, setEditOpen] = useState(false);

  const customer = customers.find((c) => c.id === params.id);

  if (!customer) {
    return (
      <div className="p-6">
        <EmptyState
          icon={UsersIcon}
          title="Cliente no encontrado"
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/clientes">
                <ArrowLeftIcon className="size-4" /> Volver a clientes
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const customerOrders = orders
    .filter((o) => o.customerId === customer.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const serviceName = (id: string) =>
    services.find((s) => s.id === id)?.name ?? "Servicio";

  function handleDelete() {
    if (!customer) return;
    const result = deleteCustomer(customer.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Cliente eliminado");
    router.push("/clientes");
  }

  return (
    <div className="p-6 space-y-4">
      <Link
        href="/clientes"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" /> Clientes
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback className="bg-sub-nav-bg font-semibold text-brand">
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-brand">
              {customer.name}
            </h1>
            <div className="filo-edge w-16" aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <PhoneIcon className="size-3.5" /> {customer.phone}
              </span>
              {customer.email && (
                <span className="flex items-center gap-1">
                  <MailIcon className="size-3.5" /> {customer.email}
                </span>
              )}
              <span>Cliente desde {formatDate(customer.createdAt)}</span>
            </div>
          </div>
        </div>
        {isSuperadmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <PencilIcon className="size-4" /> Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-cancelled-fg">
                  <Trash2Icon className="size-4" /> Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se eliminará a {customer.name}. Esta acción no se puede
                    deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Volver</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold text-brand">
          Historial de órdenes ({customerOrders.length})
        </h2>
        {customerOrders.length === 0 ? (
          <EmptyState
            icon={ScrollTextIcon}
            title="Sin órdenes"
            description="Este cliente todavía no tiene órdenes registradas."
          />
        ) : (
          <div className="grid gap-2 lg:grid-cols-2">
            {customerOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                customerName={customer.name}
                serviceName={serviceName(order.serviceId)}
              />
            ))}
          </div>
        )}
      </div>

      <CustomerDialog
        key={`${customer.id}-${editOpen}`}
        customer={customer}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
