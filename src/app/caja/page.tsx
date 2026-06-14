"use client";

import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  BanknoteIcon,
  CreditCardIcon,
  LinkIcon,
  PlusIcon,
  WalletIcon,
} from "lucide-react";
import { useState } from "react";
import { MovementDialog } from "@/components/caja/movement-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
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
import { getCashBalance, useMockData } from "@/lib/mock-data/store";
import {
  MOVEMENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  type MovementType,
  type PaymentMethod,
} from "@/lib/mock-data/types";
import { cn } from "@/lib/utils";

const METHOD_ICON: Record<
  PaymentMethod,
  React.ComponentType<{ className?: string }>
> = {
  CASH: BanknoteIcon,
  CARD: CreditCardIcon,
  TRANSFER: LinkIcon,
};

const ALL_METHODS: PaymentMethod[] = ["CASH", "CARD", "TRANSFER"];

function BalanceCard({
  label,
  amount,
  icon: Icon,
  accent,
}: {
  label: string;
  amount: number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-4",
        accent ? "border-gold/40 bg-gold/5" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <Icon
          className={cn(
            "size-4 shrink-0",
            accent ? "text-gold" : "text-muted-foreground",
          )}
        />
      </div>
      <span
        className={cn(
          "font-heading text-2xl font-bold",
          accent ? "text-gold" : "text-brand",
        )}
      >
        {formatMoney(amount)}
      </span>
    </div>
  );
}

export default function CajaPage() {
  const { cashMovements, users } = useMockData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<MovementType | "ALL">("ALL");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "ALL">(
    "ALL",
  );

  const totalBalance = getCashBalance(cashMovements);
  const cashBalance = getCashBalance(cashMovements, "CASH");
  const cardBalance = getCashBalance(cashMovements, "CARD");
  const transferBalance = getCashBalance(cashMovements, "TRANSFER");

  const filtered = cashMovements
    .filter((m) => typeFilter === "ALL" || m.type === typeFilter)
    .filter((m) => methodFilter === "ALL" || m.method === methodFilter)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const userName = (id: string) =>
    users.find((u) => u.id === id)?.fullName ?? id;

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Caja"
        subtitle={`${cashMovements.length} movimientos`}
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-brand hover:bg-brand/90"
          >
            <PlusIcon className="size-4" /> Registrar movimiento
          </Button>
        }
      />

      {/* Balance cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <BalanceCard
          label="Saldo total"
          amount={totalBalance}
          icon={WalletIcon}
          accent
        />
        <BalanceCard
          label="Efectivo"
          amount={cashBalance}
          icon={BanknoteIcon}
        />
        <BalanceCard
          label="Tarjeta"
          amount={cardBalance}
          icon={CreditCardIcon}
        />
        <BalanceCard
          label="Transferencia"
          amount={transferBalance}
          icon={LinkIcon}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          type="single"
          value={typeFilter}
          onValueChange={(v) => {
            if (v) setTypeFilter(v as MovementType | "ALL");
          }}
          className="gap-1"
        >
          <ToggleGroupItem value="ALL" size="sm">
            Todos
          </ToggleGroupItem>
          <ToggleGroupItem value="IN" size="sm">
            <ArrowUpCircleIcon className="size-3.5 text-brand" />
            {MOVEMENT_TYPE_LABELS.IN}
          </ToggleGroupItem>
          <ToggleGroupItem value="OUT" size="sm">
            <ArrowDownCircleIcon className="size-3.5 text-cancelled-fg" />
            {MOVEMENT_TYPE_LABELS.OUT}
          </ToggleGroupItem>
        </ToggleGroup>

        <ToggleGroup
          type="single"
          value={methodFilter}
          onValueChange={(v) => {
            if (v) setMethodFilter(v as PaymentMethod | "ALL");
          }}
          className="gap-1"
        >
          <ToggleGroupItem value="ALL" size="sm">
            Todos
          </ToggleGroupItem>
          {ALL_METHODS.map((m) => {
            const Icon = METHOD_ICON[m];
            return (
              <ToggleGroupItem key={m} value={m} size="sm">
                <Icon className="size-3.5" />
                {PAYMENT_METHOD_LABELS[m]}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={WalletIcon}
          title="Sin movimientos"
          description="No hay movimientos que coincidan con los filtros seleccionados."
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {filtered.map((mov) => {
              const Icon = METHOD_ICON[mov.method];
              const isIn = mov.type === "IN";
              return (
                <div
                  key={mov.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5"
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                      isIn
                        ? "bg-brand/10 text-brand"
                        : "bg-cancelled/20 text-cancelled-fg",
                    )}
                  >
                    {isIn ? (
                      <ArrowUpCircleIcon className="size-4" />
                    ) : (
                      <ArrowDownCircleIcon className="size-4" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-semibold">{mov.concept}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon className="size-3" />
                      {PAYMENT_METHOD_LABELS[mov.method]} ·{" "}
                      {formatDateTime(mov.createdAt)}
                    </span>
                    {mov.notes && (
                      <span className="text-xs text-muted-foreground">
                        {mov.notes}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-sm font-semibold",
                      isIn ? "text-brand" : "text-cancelled-fg",
                    )}
                  >
                    {isIn ? "+" : "−"}
                    {formatMoney(mov.amount)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden rounded-lg border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Registrado por</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((mov) => {
                  const Icon = METHOD_ICON[mov.method];
                  const isIn = mov.type === "IN";
                  return (
                    <TableRow key={mov.id}>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-2xs uppercase tracking-widest",
                            isIn
                              ? "bg-brand/10 text-brand"
                              : "bg-cancelled/20 text-cancelled-fg",
                          )}
                        >
                          {isIn ? (
                            <ArrowUpCircleIcon className="size-3" />
                          ) : (
                            <ArrowDownCircleIcon className="size-3" />
                          )}
                          {MOVEMENT_TYPE_LABELS[mov.type]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{mov.concept}</span>
                          {mov.notes && (
                            <span className="text-xs text-muted-foreground">
                              {mov.notes}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Icon className="size-3.5" />
                          {PAYMENT_METHOD_LABELS[mov.method]}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {userName(mov.registeredById)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {formatDateTime(mov.createdAt)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono font-semibold",
                          isIn ? "text-brand" : "text-cancelled-fg",
                        )}
                      >
                        {isIn ? "+" : "−"}
                        {formatMoney(mov.amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <MovementDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
