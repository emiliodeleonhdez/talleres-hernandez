"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDownIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ClientAvatar } from "@/components/shared/client-avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/format";
import { useMockData } from "@/lib/mock-data/store";
import type { NewOrderProductInput } from "@/lib/mock-data/store";
import {
  CFDI_USES,
  computeOrderAmounts,
  REGLAS_STATUS_LABELS,
} from "@/lib/mock-data/types";
import { cn } from "@/lib/utils";

const orderSchema = z
  .object({
    clientMode: z.enum(["existing", "new"]),
    existingClientId: z.string().optional(),
    newClientName: z.string().optional(),
    newClientPhone: z.string().optional(),
    bladeTypeId: z.string().min(1, "Selecciona el tipo de cuchilla"),
    serviceId: z.string().min(1, "Selecciona el servicio"),
    quotedPrice: z.coerce.number<number>().positive("Cotización inválida"),
    requiresInvoice: z.boolean(),
    rfc: z.string().optional(),
    razonSocial: z.string().optional(),
    cfdiUse: z.string().optional(),
    droppedOffBy: z.string().min(1, "¿Quién entrega la cuchilla?"),
    estimatedDelivery: z.string().min(1, "Requerido"),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.clientMode === "existing" && !data.existingClientId) {
      ctx.addIssue({
        code: "custom",
        message: "Selecciona un cliente",
        path: ["existingClientId"],
      });
    }
    if (data.clientMode === "new") {
      if (!data.newClientName?.trim()) {
        ctx.addIssue({ code: "custom", message: "Requerido", path: ["newClientName"] });
      }
      if (!data.newClientPhone?.trim()) {
        ctx.addIssue({ code: "custom", message: "Requerido", path: ["newClientPhone"] });
      }
    }
    if (data.requiresInvoice) {
      const rfc = data.rfc?.trim() ?? "";
      if (rfc.length < 12 || rfc.length > 13) {
        ctx.addIssue({
          code: "custom",
          message: "RFC de 12 o 13 caracteres",
          path: ["rfc"],
        });
      }
      if (!data.razonSocial?.trim()) {
        ctx.addIssue({ code: "custom", message: "Requerido", path: ["razonSocial"] });
      }
      if (!data.cfdiUse) {
        ctx.addIssue({ code: "custom", message: "Requerido", path: ["cfdiUse"] });
      }
    }
  });

type OrderFormValues = z.infer<typeof orderSchema>;

function StepLabel({ step, label }: { step: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="size-4.5 rounded-xs text-xs bg-brand text-white flex items-center justify-center font-mono">
        {step}
      </div>
      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

const clientModes = [
  { value: "existing", label: "Cliente existente" },
  { value: "new", label: "Nuevo cliente" },
] as const;

interface RegletaRow extends NewOrderProductInput {
  key: number;
}

export function NewOrderDialog(props: React.ComponentProps<typeof Dialog>) {
  const router = useRouter();
  const { customers, bladeTypes, services, products, createOrder } =
    useMockData();
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [regletas, setRegletas] = useState<RegletaRow[]>([]);
  const [regletaKey, setRegletaKey] = useState(1);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      clientMode: "existing",
      existingClientId: "",
      newClientName: "",
      newClientPhone: "",
      bladeTypeId: "",
      serviceId: "",
      quotedPrice: 0,
      requiresInvoice: false,
      rfc: "",
      razonSocial: "",
      cfdiUse: "G03",
      droppedOffBy: "",
      estimatedDelivery: "",
      notes: "",
    },
  });

  const clientMode = useWatch({ control: form.control, name: "clientMode" });
  const bladeTypeId = useWatch({ control: form.control, name: "bladeTypeId" });
  const quotedPrice = useWatch({ control: form.control, name: "quotedPrice" });
  const requiresInvoice = useWatch({
    control: form.control,
    name: "requiresInvoice",
  });

  const activeBladeTypes = bladeTypes.filter((b) => b.active);
  const bladeServices = services.filter(
    (s) => s.bladeTypeId === bladeTypeId && s.active,
  );
  const activeProducts = products.filter((p) => p.active);

  const amounts = computeOrderAmounts(Number(quotedPrice) || 0, requiresInvoice);
  const regletasTotal = regletas.reduce((sum, r) => {
    const product = products.find((p) => p.id === r.productId);
    return sum + (product ? product.price * r.quantity : 0);
  }, 0);

  function resetAll() {
    form.reset();
    setRegletas([]);
  }

  function onSubmit(values: OrderFormValues) {
    const order = createOrder({
      customerId:
        values.clientMode === "existing" ? values.existingClientId : undefined,
      newCustomer:
        values.clientMode === "new"
          ? {
              name: values.newClientName!.trim(),
              phone: values.newClientPhone!.trim(),
            }
          : undefined,
      bladeTypeId: values.bladeTypeId,
      serviceId: values.serviceId,
      quotedPrice: Number(values.quotedPrice),
      requiresInvoice: values.requiresInvoice,
      invoice: values.requiresInvoice
        ? {
            rfc: values.rfc!.trim(),
            razonSocial: values.razonSocial!.trim(),
            cfdiUse: values.cfdiUse!,
          }
        : undefined,
      products: regletas.filter((r) => r.productId && r.quantity > 0),
      droppedOffBy: values.droppedOffBy.trim(),
      estimatedDelivery: new Date(values.estimatedDelivery).toISOString(),
      notes: values.notes,
    });
    toast.success(`Orden ${order.folio} creada`);
    resetAll();
    props.onOpenChange?.(false);
    router.push(`/ordenes/${order.folio}`);
  }

  return (
    <Dialog {...props}>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-dialog overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-brand">
            Nueva orden
          </DialogTitle>
          <div className="filo-edge w-12" aria-hidden="true" />
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 1 — Cliente */}
            <div className="space-y-3">
              <StepLabel step={1} label="Cliente" />
              <div className="flex gap-2">
                {clientModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => {
                      form.setValue("clientMode", mode.value);
                      form.clearErrors([
                        "existingClientId",
                        "newClientName",
                        "newClientPhone",
                      ]);
                    }}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                      clientMode === mode.value
                        ? "bg-brand text-white border-transparent"
                        : "border-border text-muted-foreground bg-transparent",
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              {clientMode === "existing" ? (
                <FormField
                  control={form.control}
                  name="existingClientId"
                  render={({ field }) => {
                    const selectedClient = customers.find(
                      (c) => c.id === field.value,
                    );
                    return (
                      <FormItem>
                        {selectedClient ? (
                          <ClientAvatar
                            client={selectedClient}
                            onClear={() => {
                              field.onChange("");
                              form.clearErrors("existingClientId");
                            }}
                          />
                        ) : (
                          <Popover
                            open={clientSearchOpen}
                            onOpenChange={setClientSearchOpen}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <button
                                  type="button"
                                  className="flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                                >
                                  Seleccionar cliente
                                  <ChevronsUpDownIcon className="size-4 opacity-50" />
                                </button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              align="start"
                              className="w-(--radix-popover-trigger-width) p-0"
                            >
                              <Command>
                                <CommandInput placeholder="Buscar cliente..." />
                                <CommandList>
                                  <CommandEmpty>
                                    No se encontraron clientes.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {customers.map((client) => (
                                      <CommandItem
                                        key={client.id}
                                        value={client.name}
                                        onSelect={() => {
                                          field.onChange(client.id);
                                          setClientSearchOpen(false);
                                        }}
                                      >
                                        {client.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              ) : (
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="newClientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Nombre del cliente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newClientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Teléfono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
            <Separator />
            {/* 2 — Cuchilla y servicio */}
            <div className="space-y-3">
              <StepLabel step={2} label="Cuchilla y servicio" />
              <FormField
                control={form.control}
                name="bladeTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de cuchilla</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("serviceId", "");
                        form.setValue("quotedPrice", 0);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        {activeBladeTypes.map((blade) => (
                          <SelectItem key={blade.id} value={blade.id}>
                            {blade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servicio</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        const service = services.find((s) => s.id === val);
                        if (service) {
                          form.setValue("quotedPrice", service.basePrice);
                        }
                      }}
                      value={field.value}
                      disabled={!bladeTypeId}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              bladeTypeId
                                ? "Seleccionar servicio"
                                : "Primero elige la cuchilla"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        {bladeServices.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} — {formatMoney(service.basePrice)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quotedPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio cotizado (MXN)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator />
            {/* 3 — Facturación */}
            <div className="space-y-3">
              <StepLabel step={3} label="Facturación" />
              <FormField
                control={form.control}
                name="requiresInvoice"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Requiere factura (+16% IVA)
                    </FormLabel>
                  </FormItem>
                )}
              />
              {requiresInvoice && (
                <div className="space-y-2 rounded-lg border border-border bg-sub-nav-bg p-3">
                  <FormField
                    control={form.control}
                    name="rfc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RFC</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="XAXX010101000"
                            maxLength={13}
                            className="font-mono uppercase"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="razonSocial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón social</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cfdiUse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Uso CFDI</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccionar uso" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper">
                            {CFDI_USES.map((use) => (
                              <SelectItem key={use.value} value={use.value}>
                                {use.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
            <Separator />
            {/* 4 — Regletas */}
            <div className="space-y-3">
              <StepLabel step={4} label="Regletas (opcional)" />
              {regletas.map((row, index) => {
                const product = products.find((p) => p.id === row.productId);
                return (
                  <div key={row.key} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Select
                        value={row.productId}
                        onValueChange={(val) =>
                          setRegletas((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, productId: val } : r,
                            ),
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Regleta" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {activeProducts.map((p) => (
                            <SelectItem
                              key={p.id}
                              value={p.id}
                              disabled={p.stock === 0}
                            >
                              {p.name} — {formatMoney(p.price)}
                              {p.stock === 0 ? " (sin stock)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={product?.stock ?? 99}
                          value={row.quantity}
                          onChange={(e) =>
                            setRegletas((prev) =>
                              prev.map((r, i) =>
                                i === index
                                  ? { ...r, quantity: Number(e.target.value) }
                                  : r,
                              ),
                            )
                          }
                          className="w-20"
                          aria-label="Cantidad"
                        />
                        <Select
                          value={row.status}
                          onValueChange={(val) =>
                            setRegletas((prev) =>
                              prev.map((r, i) =>
                                i === index
                                  ? { ...r, status: val as RegletaRow["status"] }
                                  : r,
                              ),
                            )
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectItem value="SEPARATED">
                              {REGLAS_STATUS_LABELS.SEPARATED}
                            </SelectItem>
                            <SelectItem value="WITH_BLADE">
                              {REGLAS_STATUS_LABELS.WITH_BLADE}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      onClick={() =>
                        setRegletas((prev) => prev.filter((_, i) => i !== index))
                      }
                      aria-label="Quitar regleta"
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setRegletas((prev) => [
                    ...prev,
                    {
                      key: regletaKey,
                      productId: "",
                      quantity: 1,
                      status: "SEPARATED",
                    },
                  ]);
                  setRegletaKey((k) => k + 1);
                }}
              >
                <PlusIcon className="size-4" /> Agregar regleta
              </Button>
            </div>
            <Separator />
            {/* 5 — Entrega */}
            <div className="space-y-3">
              <StepLabel step={5} label="Recepción y entrega" />
              <FormField
                control={form.control}
                name="droppedOffBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Quién entrega la cuchilla?</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de quien la deja" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entrega estimada</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Estado de la cuchilla, observaciones..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {/* Resumen */}
            <div className="space-y-1 rounded-lg border border-border bg-sub-nav-bg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatMoney(amounts.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA (16%)</span>
                <span className="font-mono">{formatMoney(amounts.ivaAmount)}</span>
              </div>
              {regletasTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Regletas</span>
                  <span className="font-mono">{formatMoney(regletasTotal)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="font-mono">
                  {formatMoney(amounts.total + regletasTotal)}
                </span>
              </div>
              <div className="flex justify-between text-gold">
                <span>Anticipo (50% del servicio)</span>
                <span className="font-mono">
                  {formatMoney(amounts.advanceAmount)}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetAll();
                  props.onOpenChange?.(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-brand hover:bg-brand/90">
                Crear orden
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
