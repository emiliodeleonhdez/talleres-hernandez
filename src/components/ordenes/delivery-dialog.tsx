"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMoney } from "@/lib/format";
import { useMockData } from "@/lib/mock-data/store";
import type { Order, PaymentMethod } from "@/lib/mock-data/types";
import { PAYMENT_METHOD_LABELS } from "@/lib/mock-data/types";

interface DeliveryDialogProps {
  order: Order;
  balance: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** "¿Quién recoge?" — fired by the READY → DELIVERED transition. */
export function DeliveryDialog({
  order,
  balance,
  open,
  onOpenChange,
}: DeliveryDialogProps) {
  const { updateOrderStatus, addPayment } = useMockData();
  const [pickedUpBy, setPickedUpBy] = useState(order.droppedOffBy);
  const [pickedUpPhone, setPickedUpPhone] = useState("");
  const [settleBalance, setSettleBalance] = useState(balance > 0);
  const [method, setMethod] = useState<PaymentMethod>("CASH");

  function handleConfirm() {
    if (!pickedUpBy.trim()) {
      toast.error("Captura quién recoge la cuchilla.");
      return;
    }
    if (settleBalance && balance > 0) {
      const payment = addPayment(order.id, {
        type: "FINAL",
        method,
        amount: balance,
      });
      if (!payment.ok) {
        toast.error(payment.error);
        return;
      }
    }
    const result = updateOrderStatus(order.id, "DELIVERED", {
      pickedUpBy: pickedUpBy.trim(),
      pickedUpPhone,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Orden ${order.folio} entregada`);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setPickedUpBy(order.droppedOffBy);
          setPickedUpPhone("");
          setSettleBalance(balance > 0);
          setMethod("CASH");
        }
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-brand">
            ¿Quién recoge?
          </DialogTitle>
          <div className="filo-edge w-12" aria-hidden="true" />
          <DialogDescription>
            Confirma la entrega de la orden {order.folio}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="picked-up-by">Nombre de quien recoge</Label>
            <Input
              id="picked-up-by"
              value={pickedUpBy}
              onChange={(e) => setPickedUpBy(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Prellenado con quien dejó la cuchilla; edítalo si recoge otra
              persona.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="picked-up-phone">Teléfono (opcional)</Label>
            <Input
              id="picked-up-phone"
              type="tel"
              value={pickedUpPhone}
              onChange={(e) => setPickedUpPhone(e.target.value)}
            />
          </div>
          {balance > 0 && (
            <div className="space-y-3 rounded-lg border border-border bg-sub-nav-bg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Saldo pendiente</span>
                <span className="font-mono font-semibold text-fofo">
                  {formatMoney(balance)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="settle-balance"
                  checked={settleBalance}
                  onCheckedChange={(v) => setSettleBalance(v === true)}
                />
                <Label htmlFor="settle-balance" className="font-normal">
                  Registrar liquidación al entregar
                </Label>
              </div>
              {settleBalance && (
                <Select
                  value={method}
                  onValueChange={(v) => setMethod(v as PaymentMethod)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {(
                      Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]
                    ).map((m) => (
                      <SelectItem key={m} value={m}>
                        {PAYMENT_METHOD_LABELS[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="bg-brand hover:bg-brand/90">
            Confirmar entrega
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
