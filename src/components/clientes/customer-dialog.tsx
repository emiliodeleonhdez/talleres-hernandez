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
import { useMockData } from "@/lib/mock-data/store";
import type { Customer } from "@/lib/mock-data/types";

interface CustomerDialogProps {
  customer?: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDialog({
  customer,
  open,
  onOpenChange,
}: CustomerDialogProps) {
  const { createCustomer, updateCustomer } = useMockData();
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");

  function handleSubmit() {
    if (!name.trim() || !phone.trim()) {
      toast.error("Nombre y teléfono son obligatorios.");
      return;
    }
    if (customer) {
      updateCustomer(customer.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
      });
      toast.success("Cliente actualizado");
    } else {
      createCustomer({ name: name.trim(), phone: phone.trim(), email });
      toast.success("Cliente creado");
    }
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setName(customer?.name ?? "");
          setPhone(customer?.phone ?? "");
          setEmail(customer?.email ?? "");
        }
        onOpenChange(o);
      }}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-heading text-brand">
            {customer ? "Editar cliente" : "Nuevo cliente"}
          </DialogTitle>
          <div className="filo-edge w-12" aria-hidden="true" />
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Nombre</Label>
            <Input
              id="customer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre o negocio"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-phone">Teléfono</Label>
            <Input
              id="customer-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+52 55 ..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-email">Correo (opcional)</Label>
            <Input
              id="customer-email"
              type="email"
              value={email ?? ""}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-brand hover:bg-brand/90">
            {customer ? "Guardar" : "Crear cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
