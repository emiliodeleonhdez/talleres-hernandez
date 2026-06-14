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
import { Textarea } from "@/components/ui/textarea";
import { useMockData } from "@/lib/mock-data/store";
import type { BladeType } from "@/lib/mock-data/types";

interface BladeTypeDialogProps {
  bladeType?: BladeType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BladeTypeDialog({
  bladeType,
  open,
  onOpenChange,
}: BladeTypeDialogProps) {
  const { createBladeType, updateBladeType } = useMockData();
  const [name, setName] = useState(bladeType?.name ?? "");
  const [description, setDescription] = useState(
    bladeType?.description ?? "",
  );
  const [active, setActive] = useState(bladeType?.active ?? true);

  function reset(bt?: BladeType) {
    setName(bt?.name ?? "");
    setDescription(bt?.description ?? "");
    setActive(bt?.active ?? true);
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Captura el nombre del tipo de cuchilla.");
      return;
    }
    if (bladeType) {
      updateBladeType(bladeType.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        active,
      });
      toast.success("Tipo de cuchilla actualizado");
    } else {
      createBladeType({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Tipo de cuchilla creado");
    }
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) reset(bladeType);
        onOpenChange(o);
      }}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-heading text-brand">
            {bladeType ? "Editar tipo de cuchilla" : "Nuevo tipo de cuchilla"}
          </DialogTitle>
          <div className="filo-edge w-12" aria-hidden="true" />
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bt-name">Nombre</Label>
            <Input
              id="bt-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Cuchilla recta para guillotina"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bt-desc">Descripción (opcional)</Label>
            <Textarea
              id="bt-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Materiales, tamaños típicos, etc."
            />
          </div>
          {bladeType && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="bt-active"
                checked={active}
                onCheckedChange={(v) => setActive(Boolean(v))}
              />
              <Label htmlFor="bt-active">Activo</Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-brand hover:bg-brand/90">
            {bladeType ? "Guardar" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
