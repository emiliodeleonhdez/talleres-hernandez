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
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMockData } from "@/lib/mock-data/store";
import {
  MOVEMENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  type MovementType,
  type PaymentMethod,
} from "@/lib/mock-data/types";

interface MovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const METHODS: PaymentMethod[] = ["CASH", "CARD", "TRANSFER"];

export function MovementDialog({ open, onOpenChange }: MovementDialogProps) {
  const { addCashMovement } = useMockData();
  const [movType, setMovType] = useState<MovementType>("IN");
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [notes, setNotes] = useState("");

  function reset() {
    setMovType("IN");
    setConcept("");
    setAmount("");
    setMethod("CASH");
    setNotes("");
  }

  function handleSubmit() {
    const parsed = Number(amount);
    if (!concept.trim() || !parsed || parsed <= 0) {
      toast.error("Captura concepto y monto válidos.");
      return;
    }
    addCashMovement({
      type: movType,
      concept: concept.trim(),
      amount: parsed,
      method,
      notes: notes.trim() || undefined,
    });
    toast.success(
      movType === "IN" ? "Entrada registrada" : "Salida registrada",
    );
    onOpenChange(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-heading text-brand">
            Registrar movimiento
          </DialogTitle>
          <div className="filo-edge w-12" aria-hidden="true" />
        </DialogHeader>

        <div className="space-y-4">
          {/* IN / OUT toggle */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <ToggleGroup
              type="single"
              value={movType}
              onValueChange={(v) => {
                if (v) setMovType(v as MovementType);
              }}
              className="justify-start gap-2"
            >
              <ToggleGroupItem
                value="IN"
                className="data-[state=on]:bg-brand data-[state=on]:text-white"
              >
                {MOVEMENT_TYPE_LABELS.IN}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="OUT"
                className="data-[state=on]:bg-cancelled data-[state=on]:text-cancelled-fg"
              >
                {MOVEMENT_TYPE_LABELS.OUT}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Concept */}
          <div className="space-y-2">
            <Label htmlFor="mov-concept">Concepto</Label>
            <Input
              id="mov-concept"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej. Pago de renta, Venta de regleta..."
            />
          </div>

          {/* Amount + Method */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="mov-amount">Monto (MXN)</Label>
              <Input
                id="mov-amount"
                type="number"
                inputMode="decimal"
                min={0.01}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mov-method">Método</Label>
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as PaymentMethod)}
              >
                <SelectTrigger id="mov-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {PAYMENT_METHOD_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="mov-notes">Notas (opcional)</Label>
            <Textarea
              id="mov-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Referencia, proveedor, etc."
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
