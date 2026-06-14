"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import type { Order, PaymentMethod, PaymentType } from "@/lib/mock-data/types";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_TYPE_LABELS,
} from "@/lib/mock-data/types";

interface PaymentDialogProps {
  order: Order;
  suggestedType: PaymentType;
  suggestedAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDialog({
  order,
  suggestedType,
  suggestedAmount,
  open,
  onOpenChange,
}: PaymentDialogProps) {
  const { addPayment } = useMockData();
  const [type, setType] = useState<PaymentType>(suggestedType);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [amount, setAmount] = useState(String(suggestedAmount));

  function handleSubmit() {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) {
      toast.error("Captura un monto válido.");
      return;
    }
    const result = addPayment(order.id, { type, method, amount: parsed });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      `${PAYMENT_TYPE_LABELS[type]} de ${formatMoney(parsed)} registrado`,
    );
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setType(suggestedType);
          setAmount(String(suggestedAmount));
          setMethod("CASH");
        }
        onOpenChange(o);
      }}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-heading text-brand">
            Registrar pago
          </DialogTitle>
          <div className="filo-edge w-12" aria-hidden="true" />
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de pago</Label>
            <Select value={type} onValueChange={(v) => setType(v as PaymentType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="ADVANCE" disabled={order.advancePaid}>
                  {PAYMENT_TYPE_LABELS.ADVANCE} (50%)
                </SelectItem>
                <SelectItem value="FINAL">
                  {PAYMENT_TYPE_LABELS.FINAL}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Método</Label>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Monto (MXN)</Label>
            <Input
              id="payment-amount"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-brand hover:bg-brand/90">
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
