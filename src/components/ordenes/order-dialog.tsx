"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { NavAction } from "@/components/layout/components/nav-action";
import { ClientAvatar } from "@/components/shared/client-avatar";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { mockClients } from "@/lib/mock-clients";

const orderSchema = z
  .object({
    clientMode: z.enum(["existing", "new"]),
    existingClientId: z.string().optional(),
    newClientName: z.string().optional(),
    product: z.string().min(1, "Requerido"),
    deliveryTime: z.string().min(1, "Requerido"),
    status: z.enum(["en-proceso", "listo", "recibido", "entregada"]),
  })
  .superRefine((data, ctx) => {
    if (data.clientMode === "existing" && !data.existingClientId) {
      ctx.addIssue({
        code: "custom",
        message: "Selecciona un cliente",
        path: ["existingClientId"],
      });
    }
    if (data.clientMode === "new" && !data.newClientName?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Requerido",
        path: ["newClientName"],
      });
    }
  });

type OrderFormValues = z.infer<typeof orderSchema>;

function NewOrderFormLabel({ step, label }: { step: number; label: string }) {
  return (
    <FormLabel className="flex items-center gap-2">
      <div className="size-4.5 rounded-xs text-xs bg-brand text-white flex items-center justify-center">
        {step}
      </div>
      <span className="text-muted-foreground font-semibold uppercase">
        {label}
      </span>
    </FormLabel>
  );
}

const clientModes = [
  { value: "existing", label: "Cliente existente" },
  { value: "new", label: "Nuevo cliente" },
] as const;

export function OrderDialog(props: React.ComponentProps<typeof Dialog>) {
  const [clientSearchOpen, setClientSearchOpen] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      clientMode: "existing",
      existingClientId: "",
      newClientName: "",
      product: "",
      deliveryTime: "",
      status: "en-proceso",
    },
  });

  const clientMode = useWatch({ control: form.control, name: "clientMode" });

  function onSubmit(values: OrderFormValues) {
    console.log(values);
    props.onOpenChange?.(false);
  }

  return (
    <Dialog {...props}>
      <DialogTrigger asChild>
        <NavAction
          icon={PlusIcon}
          label="Nueva Orden"
          props={{
            variant: "ghost",
            onClick: () => props.onOpenChange?.(true),
          }}
        />
      </DialogTrigger>
      <DialogContent
        aria-describedby="new-order-dialog-description"
        className="overflow-auto"
      >
        <DialogHeader>
          <DialogTitle>Nueva Orden</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-3">
              <NewOrderFormLabel step={1} label="Cliente" />
              <div className="flex gap-2">
                {clientModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => {
                      form.setValue("clientMode", mode.value);
                      form.clearErrors(["existingClientId", "newClientName"]);
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
                    const selectedClient = mockClients.find(
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
                                    {mockClients.map((client) => (
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
              )}
            </div>
            <Separator />
            <FormField
              control={form.control}
              name="product"
              render={({ field }) => (
                <FormItem>
                  <NewOrderFormLabel step={2} label="Producto" />
                  <FormControl>
                    <Input placeholder="Ej. Cuchilla Circular 14" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <FormField
              control={form.control}
              name="deliveryTime"
              render={({ field }) => (
                <FormItem>
                  <NewOrderFormLabel step={3} label="Entrega estimada" />
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <NewOrderFormLabel step={4} label="Estado" />
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper">
                      <SelectItem value="en-proceso">En proceso</SelectItem>
                      <SelectItem value="listo">Listo p/ entrega</SelectItem>
                      <SelectItem value="recibido">Recibido</SelectItem>
                      <SelectItem value="entregada">Entregada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => props.onOpenChange?.(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Crear Orden</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
