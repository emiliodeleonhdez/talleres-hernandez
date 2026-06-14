"use client";

import {
  LayersIcon,
  PencilIcon,
  PlusIcon,
  ScissorsIcon,
  Trash2Icon,
  WrenchIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BladeTypeDialog } from "@/components/catalogo/blade-type-dialog";
import { ServiceDialog } from "@/components/catalogo/service-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { formatMoney } from "@/lib/format";
import { useMockData } from "@/lib/mock-data/store";
import type { BladeType, Service } from "@/lib/mock-data/types";

export default function CatalogoPage() {
  const { bladeTypes, services, isSuperadmin, deleteBladeType, deleteService } =
    useMockData();

  const [btDialogOpen, setBtDialogOpen] = useState(false);
  const [editingBt, setEditingBt] = useState<BladeType | null>(null);
  const [deletingBt, setDeletingBt] = useState<BladeType | null>(null);

  const [svcDialogOpen, setSvcDialogOpen] = useState(false);
  const [newSvcBladeTypeId, setNewSvcBladeTypeId] = useState<string>("");
  const [editingSvc, setEditingSvc] = useState<Service | null>(null);
  const [deletingSvc, setDeletingSvc] = useState<Service | null>(null);

  const activeBladeTypes = bladeTypes.filter((bt) => bt.active);
  const allBladeTypes = bladeTypes;

  function servicesFor(bladeTypeId: string) {
    return services
      .filter((s) => s.bladeTypeId === bladeTypeId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function openNewService(bladeTypeId: string) {
    setNewSvcBladeTypeId(bladeTypeId);
    setSvcDialogOpen(true);
  }

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Catálogo"
        subtitle={`${activeBladeTypes.length} tipos de cuchilla · ${services.filter((s) => s.active).length} servicios activos`}
        actions={
          isSuperadmin ? (
            <Button
              onClick={() => setBtDialogOpen(true)}
              className="bg-brand hover:bg-brand/90"
            >
              <PlusIcon className="size-4" /> Nuevo tipo
            </Button>
          ) : undefined
        }
      />

      {allBladeTypes.length === 0 ? (
        <EmptyState
          icon={ScissorsIcon}
          title="Sin tipos de cuchilla"
          description="Crea el catálogo de tipos de cuchilla y sus servicios asociados."
          action={
            isSuperadmin ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBtDialogOpen(true)}
              >
                <PlusIcon className="size-4" /> Nuevo tipo
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Accordion type="multiple" defaultValue={activeBladeTypes.map((bt) => bt.id)}>
          {allBladeTypes
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((bt) => {
              const btServices = servicesFor(bt.id);
              const activeCount = btServices.filter((s) => s.active).length;
              return (
                <AccordionItem key={bt.id} value={bt.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-1 items-center gap-3 pr-2 text-left">
                      <LayersIcon className="size-4 shrink-0 text-gold" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold leading-tight">
                          {bt.name}
                        </span>
                        {bt.description && (
                          <span className="text-xs text-muted-foreground font-normal">
                            {bt.description}
                          </span>
                        )}
                      </div>
                      <div className="ml-auto flex shrink-0 items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {activeCount} serv.
                        </span>
                        {!bt.active && (
                          <Badge
                            variant="outline"
                            className="border-transparent bg-muted text-muted-foreground text-2xs"
                          >
                            Inactivo
                          </Badge>
                        )}
                        {isSuperadmin && (
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => setEditingBt(bt)}
                              aria-label={`Editar ${bt.name}`}
                            >
                              <PencilIcon className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-cancelled-fg"
                              onClick={() => setDeletingBt(bt)}
                              aria-label={`Eliminar ${bt.name}`}
                            >
                              <Trash2Icon className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-2 pt-1 pb-3 pl-7">
                      {btServices.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Sin servicios registrados para este tipo.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {btServices.map((svc) => (
                            <div
                              key={svc.id}
                              className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2.5"
                            >
                              <div className="flex min-w-0 flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-sm font-medium">
                                    {svc.name}
                                  </span>
                                  {!svc.active && (
                                    <Badge
                                      variant="outline"
                                      className="shrink-0 border-transparent bg-muted text-muted-foreground text-2xs"
                                    >
                                      Inactivo
                                    </Badge>
                                  )}
                                </div>
                                {svc.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {svc.description}
                                  </span>
                                )}
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span className="font-mono text-sm font-semibold text-brand">
                                  {formatMoney(svc.basePrice)}
                                </span>
                                {isSuperadmin && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-7"
                                      onClick={() => setEditingSvc(svc)}
                                      aria-label={`Editar ${svc.name}`}
                                    >
                                      <PencilIcon className="size-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-7 text-cancelled-fg"
                                      onClick={() => setDeletingSvc(svc)}
                                      aria-label={`Eliminar ${svc.name}`}
                                    >
                                      <Trash2Icon className="size-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {isSuperadmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-1"
                          onClick={() => openNewService(bt.id)}
                        >
                          <PlusIcon className="size-3.5" /> Agregar servicio
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
        </Accordion>
      )}

      {/* Blade type dialogs */}
      <BladeTypeDialog open={btDialogOpen} onOpenChange={setBtDialogOpen} />
      {editingBt && (
        <BladeTypeDialog
          key={editingBt.id}
          bladeType={editingBt}
          open
          onOpenChange={(o) => {
            if (!o) setEditingBt(null);
          }}
        />
      )}
      <AlertDialog
        open={Boolean(deletingBt)}
        onOpenChange={(o) => {
          if (!o) setDeletingBt(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tipo de cuchilla?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará {deletingBt?.name}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deletingBt) return;
                const result = deleteBladeType(deletingBt.id);
                if (!result.ok) toast.error(result.error);
                else toast.success("Tipo de cuchilla eliminado");
                setDeletingBt(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Service dialogs */}
      {svcDialogOpen && (
        <ServiceDialog
          key={`new-${newSvcBladeTypeId}`}
          bladeTypes={allBladeTypes}
          defaultBladeTypeId={newSvcBladeTypeId}
          open
          onOpenChange={(o) => {
            if (!o) {
              setSvcDialogOpen(false);
              setNewSvcBladeTypeId("");
            }
          }}
        />
      )}
      {editingSvc && (
        <ServiceDialog
          key={editingSvc.id}
          service={editingSvc}
          bladeTypes={allBladeTypes}
          open
          onOpenChange={(o) => {
            if (!o) setEditingSvc(null);
          }}
        />
      )}
      <AlertDialog
        open={Boolean(deletingSvc)}
        onOpenChange={(o) => {
          if (!o) setDeletingSvc(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará {deletingSvc?.name}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deletingSvc) return;
                const result = deleteService(deletingSvc.id);
                if (!result.ok) toast.error(result.error);
                else toast.success("Servicio eliminado");
                setDeletingSvc(null);
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
