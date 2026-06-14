"use client";

import {
  PackageIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  TriangleAlertIcon,
  WrenchIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MaterialDialog } from "@/components/inventario/material-dialog";
import { ProductDialog } from "@/components/inventario/product-dialog";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMoney } from "@/lib/format";
import { isLowStock, useMockData } from "@/lib/mock-data/store";
import type { Material, Product } from "@/lib/mock-data/types";
import { cn } from "@/lib/utils";

function LowStockBadge() {
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-pending text-pending-fg gap-1"
    >
      <TriangleAlertIcon className="size-3" /> Bajo
    </Badge>
  );
}

export default function InventoryPage() {
  const { products, materials, deleteProduct, deleteMaterial } = useMockData();
  const [productOpen, setProductOpen] = useState(false);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(
    null,
  );

  const activeProducts = products.filter((p) => p.active);
  const activeMaterials = materials.filter((m) => m.active);
  const lowMaterials = activeMaterials.filter(isLowStock);

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Inventario"
        subtitle={`${activeProducts.length} regletas · ${activeMaterials.length} materiales`}
      />

      {lowMaterials.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-pending-fg/30 bg-pending px-4 py-3 text-sm text-pending-fg">
          <TriangleAlertIcon className="size-4 shrink-0" />
          <span>
            <span className="font-semibold">{lowMaterials.length}</span>{" "}
            {lowMaterials.length === 1 ? "material" : "materiales"} en o por
            debajo del stock mínimo:{" "}
            {lowMaterials.map((m) => m.name).join(", ")}.
          </span>
        </div>
      )}

      <Tabs defaultValue="regletas">
        <TabsList>
          <TabsTrigger value="regletas">
            <PackageIcon className="size-4" /> Regletas
          </TabsTrigger>
          <TabsTrigger value="materiales">
            <WrenchIcon className="size-4" /> Materiales
          </TabsTrigger>
        </TabsList>

        {/* ---- Regletas (sellable) ---- */}
        <TabsContent value="regletas" className="space-y-3 pt-2">
          <div className="flex justify-end">
            <Button
              onClick={() => setProductOpen(true)}
              className="bg-brand hover:bg-brand/90"
              size="sm"
            >
              <PlusIcon className="size-4" /> Nueva regleta
            </Button>
          </div>
          {activeProducts.length === 0 ? (
            <EmptyState
              icon={PackageIcon}
              title="Sin regletas"
              description="Registra las regletas que se venden junto con las cuchillas."
            />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="flex flex-col gap-2 md:hidden">
                {activeProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3.5"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-semibold">
                        {product.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatMoney(product.price)} ·{" "}
                        <span
                          className={cn(
                            "font-mono",
                            product.stock === 0 && "text-cancelled-fg",
                          )}
                        >
                          {product.stock} en stock
                        </span>
                      </span>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingProduct(product)}
                        aria-label={`Editar ${product.name}`}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-cancelled-fg"
                        onClick={() => setDeletingProduct(product)}
                        aria-label={`Eliminar ${product.name}`}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden rounded-lg border border-border bg-card md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Regleta</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.description ?? "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatMoney(product.price)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-mono",
                            product.stock === 0 &&
                              "font-semibold text-cancelled-fg",
                          )}
                        >
                          {product.stock}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingProduct(product)}
                              aria-label={`Editar ${product.name}`}
                            >
                              <PencilIcon className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-cancelled-fg"
                              onClick={() => setDeletingProduct(product)}
                              aria-label={`Eliminar ${product.name}`}
                            >
                              <Trash2Icon className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        {/* ---- Materiales (internal supplies) ---- */}
        <TabsContent value="materiales" className="space-y-3 pt-2">
          <div className="flex justify-end">
            <Button
              onClick={() => setMaterialOpen(true)}
              className="bg-brand hover:bg-brand/90"
              size="sm"
            >
              <PlusIcon className="size-4" /> Nuevo material
            </Button>
          </div>
          {activeMaterials.length === 0 ? (
            <EmptyState
              icon={WrenchIcon}
              title="Sin materiales"
              description="Registra los insumos internos del taller."
            />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="flex flex-col gap-2 md:hidden">
                {activeMaterials.map((material) => {
                  const low = isLowStock(material);
                  return (
                    <div
                      key={material.id}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-lg border bg-card p-3.5",
                        low ? "border-pending-fg/40 bg-pending/40" : "border-border",
                      )}
                    >
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="truncate font-semibold">
                          {material.name}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">
                            {material.stock} {material.unit}(s) · mín.{" "}
                            {material.minStock}
                          </span>
                          {low && <LowStockBadge />}
                        </span>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingMaterial(material)}
                          aria-label={`Editar ${material.name}`}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-cancelled-fg"
                          onClick={() => setDeletingMaterial(material)}
                          aria-label={`Eliminar ${material.name}`}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Desktop table */}
              <div className="hidden rounded-lg border border-border bg-card md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Mínimo</TableHead>
                      <TableHead>Alerta</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeMaterials.map((material) => {
                      const low = isLowStock(material);
                      return (
                        <TableRow
                          key={material.id}
                          className={cn(low && "bg-pending/40")}
                        >
                          <TableCell className="font-medium">
                            {material.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {material.unit}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-mono",
                              low && "font-semibold text-pending-fg",
                            )}
                          >
                            {material.stock}
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {material.minStock}
                          </TableCell>
                          <TableCell>{low ? <LowStockBadge /> : "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingMaterial(material)}
                                aria-label={`Editar ${material.name}`}
                              >
                                <PencilIcon className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-cancelled-fg"
                                onClick={() => setDeletingMaterial(material)}
                                aria-label={`Eliminar ${material.name}`}
                              >
                                <Trash2Icon className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ProductDialog open={productOpen} onOpenChange={setProductOpen} />
      {editingProduct && (
        <ProductDialog
          key={editingProduct.id}
          product={editingProduct}
          open
          onOpenChange={(o) => {
            if (!o) setEditingProduct(null);
          }}
        />
      )}
      <MaterialDialog open={materialOpen} onOpenChange={setMaterialOpen} />
      {editingMaterial && (
        <MaterialDialog
          key={editingMaterial.id}
          material={editingMaterial}
          open
          onOpenChange={(o) => {
            if (!o) setEditingMaterial(null);
          }}
        />
      )}
      <AlertDialog
        open={Boolean(deletingProduct)}
        onOpenChange={(o) => {
          if (!o) setDeletingProduct(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar regleta?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará {deletingProduct?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deletingProduct) return;
                const result = deleteProduct(deletingProduct.id);
                if (!result.ok) toast.error(result.error);
                else toast.success("Regleta eliminada");
                setDeletingProduct(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={Boolean(deletingMaterial)}
        onOpenChange={(o) => {
          if (!o) setDeletingMaterial(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar material?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará {deletingMaterial?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deletingMaterial) return;
                deleteMaterial(deletingMaterial.id);
                toast.success("Material eliminado");
                setDeletingMaterial(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
