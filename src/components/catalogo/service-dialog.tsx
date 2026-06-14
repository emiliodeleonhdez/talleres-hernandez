"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useMockData } from "@/lib/mock-data/store";
import type { BladeType, Service } from "@/lib/mock-data/types";

interface ServiceDialogProps {
  service?: Service;
  bladeTypes: BladeType[];
  defaultBladeTypeId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceDialog({
  service,
  bladeTypes,
  defaultBladeTypeId,
  open,
  onOpenChange,
}: ServiceDialogProps) {
  const { createService, updateService } = useMockData();
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [basePrice, setBasePrice] = useState(
    String(service?.basePrice ?? ""),
  );
  const [bladeTypeId, setBladeTypeId] = useState(
    service?.bladeTypeId ?? defaultBladeTypeId ?? bladeTypes[0]?.id ?? "",
  );
  const [active, setActive] = useState(service?.active ?? true);

  function reset(s?: Service) {
    setName(s?.name ?? "");
    setDescription(s?.description ?? "");
    setBasePrice(String(s?.basePrice ?? ""));
    setBladeTypeId(
      s?.bladeTypeId ?? defaultBladeTypeId ?? bladeTypes[0]?.id ?? "",
    );
    setActive(s?.active ?? true);
  }

  function handleSubmit() {
    const parsed = Number(basePrice);
    if (!name.trim() || !parsed || parsed <= 0 || !bladeTypeId) {
      toast.error("Captura nombre, precio y tipo de cuchilla válidos.");
      return;
    }
    if (service) {
      updateService(service.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        basePrice: parsed,
        active,
      });
      toast.success("Servicio actualizado");
    } else {
      createService({
        name: name.trim(),
        description: description.trim() || undefined,
        basePrice: parsed,
        bladeTypeId,
      });
      toast.success("Servicio creado");
    }
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) reset(service);
        onOpenChange(o);
      }}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-heading text-brand">
            {service ? "Editar servicio" : "Nuevo servicio"}
          </DialogTitle>
          <div className="filo-edge w-12" aria-hidden="true" />
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="svc-name">Nombre</Label>
            <Input
              id="svc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Afilado estándar de guillotina"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-desc">Descripción (opcional)</Label>
            <Textarea
              id="svc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="svc-price">Precio base (MXN)</Label>
              <Input
                id="svc-price"
                type="number"
                inputMode="decimal"
                min={0.01}
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="font-mono"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-blade">Tipo de cuchilla</Label>
              <Select
                value={bladeTypeId}
                onValueChange={setBladeTypeId}
                disabled={Boolean(service)}
              >
                <SelectTrigger id="svc-blade">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {bladeTypes.map((bt) => (
                    <SelectItem key={bt.id} value={bt.id}>
                      {bt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {service && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="svc-active"
                checked={active}
                onCheckedChange={(v) => setActive(Boolean(v))}
              />
              <Label htmlFor="svc-active">Activo</Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-brand hover:bg-brand/90">
            {service ? "Guardar" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
