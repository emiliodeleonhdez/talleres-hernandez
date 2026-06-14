"use client";

import {
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CustomerDialog } from "@/components/clientes/customer-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { getInitials } from "@/lib/format";
import { useMockData } from "@/lib/mock-data/store";
import type { Customer } from "@/lib/mock-data/types";

export default function ClientsPage() {
  const router = useRouter();
  const { customers, orders, isSuperadmin, deleteCustomer } = useMockData();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const term = search.trim().toLowerCase();
  const filtered = customers
    .filter(
      (c) =>
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const orderCount = (customerId: string) =>
    orders.filter((o) => o.customerId === customerId).length;

  function handleDelete() {
    if (!deleting) return;
    const result = deleteCustomer(deleting.id);
    if (!result.ok) toast.error(result.error);
    else toast.success("Cliente eliminado");
    setDeleting(null);
  }

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Clientes"
        subtitle={`${customers.length} clientes registrados`}
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-brand hover:bg-brand/90"
          >
            <PlusIcon className="size-4" /> Nuevo cliente
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Sin clientes"
          description="No hay clientes que coincidan con la búsqueda."
          action={
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <PlusIcon className="size-4" /> Crear cliente
            </Button>
          }
        />
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {filtered.map((customer) => (
              <Link
                key={customer.id}
                href={`/clientes/${customer.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5 transition-colors hover:border-gold active:scale-95 transition-transform"
              >
                <Avatar>
                  <AvatarFallback className="bg-sub-nav-bg text-xs font-semibold text-brand">
                    {getInitials(customer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold">{customer.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {customer.phone}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {orderCount(customer.id)} órd.
                </span>
              </Link>
            ))}
          </div>
          {/* Desktop: table */}
          <div className="hidden rounded-lg border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead className="text-right">Órdenes</TableHead>
                  {isSuperadmin && (
                    <TableHead className="text-right">Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((customer) => (
                  <TableRow
                    key={customer.id}
                    onClick={() => router.push(`/clientes/${customer.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.phone}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {orderCount(customer.id)}
                    </TableCell>
                    {isSuperadmin && (
                      <TableCell className="text-right">
                        <div
                          className="flex justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditing(customer)}
                            aria-label={`Editar ${customer.name}`}
                          >
                            <PencilIcon className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-cancelled-fg"
                            onClick={() => setDeleting(customer)}
                            aria-label={`Eliminar ${customer.name}`}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <CustomerDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <CustomerDialog
          key={editing.id}
          customer={editing}
          open
          onOpenChange={(o) => {
            if (!o) setEditing(null);
          }}
        />
      )}
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => {
          if (!o) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a {deleting?.name}. Esta acción no se puede deshacer.
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
  );
}
