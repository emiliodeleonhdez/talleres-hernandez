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
import type { Material } from "@/lib/mock-data/types";

interface MaterialDialogProps {
  material?: Material;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialDialog({
  material,
  open,
  onOpenChange,
}: MaterialDialogProps) {
  const { createMaterial, updateMaterial } = useMockData();
  const [name, setName] = useState(material?.name ?? "");
  const [unit, setUnit] = useState(material?.unit ?? "pieza");
  const [stock, setStock] = useState(String(material?.stock ?? 0));
  const [minStock, setMinStock] = useState(String(material?.minStock ?? 0));

  function handleSubmit() {
    const parsedStock = Number(stock);
    const parsedMin = Number(minStock);
    if (!name.trim() || !unit.trim() || parsedStock < 0 || parsedMin < 0) {
      toast.error("Captura nombre, unidad y cantidades válidas.");
      return;
    }
    if (material) {
      updateMaterial(material.id, {
        name: name.trim(),
        unit: unit.trim(),
        stock: parsedStock,
        minStock: parsedMin,
      });
      toast.success("Material actualizado");
    } else {
      createMaterial({
        name: name.trim(),
        unit: unit.trim(),
        stock: parsedStock,
        minStock: parsedMin,
      });
      toast.success("Material creado");
    }
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setName(material?.name ?? "");
          setUnit(material?.unit ?? "pieza");
          setStock(String(material?.stock ?? 0));
          setMinStock(String(material?.minStock ?? 0));
        }
        onOpenChange(o);
      }}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-heading text-brand">
            {material ? "Editar material" : "Nuevo material"}
          </DialogTitle>
          <div className="filo-edge w-12" aria-hidden="true" />
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="material-name">Nombre</Label>
            <Input
              id="material-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material-unit">Unidad</Label>
            <Input
              id="material-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="pieza, litro, kg, metro..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="material-stock">Stock</Label>
              <Input
                id="material-stock"
                type="number"
                inputMode="numeric"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material-min-stock">Stock mínimo</Label>
              <Input
                id="material-min-stock"
                type="number"
                inputMode="numeric"
                min={0}
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Cuando el stock quede en o por debajo del mínimo se mostrará la
            alerta de inventario bajo.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-brand hover:bg-brand/90">
            {material ? "Guardar" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
