// TS mirrors of the Prisma models in ORDER_SCHEMA.md.
// Decimal → number (MXN pesos), DateTime → ISO string.

export type OrderStatus =
  | "RECEIVED"
  | "PENDING_ADVANCE"
  | "IN_PROGRESS"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";
export type PaymentType = "ADVANCE" | "FINAL";
export type InvoiceStatus = "NOT_REQUIRED" | "PENDING" | "ISSUED" | "CANCELLED";
export type ReglasStatus = "SEPARATED" | "WITH_BLADE";
export type MovementType = "IN" | "OUT";
export type Role = "SUPERADMIN" | "OPERATOR";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BladeType {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  active: boolean;
  createdAt: string;
  bladeTypeId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  folio: string;
  status: OrderStatus;
  customerId: string;
  bladeTypeId: string;
  serviceId: string;
  quotedPrice: number;
  subtotal: number;
  ivaAmount: number;
  total: number;
  advancePaid: boolean;
  advanceAmount: number;
  advancePaidAt: string | null;
  estimatedDelivery: string;
  deliveredAt: string | null;
  droppedOffBy: string;
  pickedUpBy: string | null;
  pickedUpPhone: string | null;
  receivedById: string;
  updatedById: string | null;
  requiresInvoice: boolean;
  invoiceStatus: InvoiceStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceData {
  id: string;
  rfc: string;
  razonSocial: string;
  cfdiUse: string;
  fiscalAddress: string | null;
  evidenceUrl: string | null;
  orderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderProduct {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  status: ReglasStatus;
  orderId: string;
  productId: string;
}

export interface OrderComment {
  id: string;
  content: string;
  createdAt: string;
  orderId: string;
  authorId: string;
}

export interface OrderStatusLog {
  id: string;
  prevStatus: OrderStatus;
  newStatus: OrderStatus;
  changedAt: string;
  orderId: string;
  changedById: string;
}

export interface Payment {
  id: string;
  type: PaymentType;
  method: PaymentMethod;
  amount: number;
  voucherUrl: string | null;
  paidAt: string;
  orderId: string;
  registeredById: string;
}

export interface CashMovement {
  id: string;
  type: MovementType;
  concept: string;
  amount: number;
  method: PaymentMethod;
  referenceId: string | null;
  referenceType: string | null;
  notes: string | null;
  createdAt: string;
  registeredById: string;
}

// ---------------------------------------------------------------------------
// Display labels (Spanish, user-facing)
// ---------------------------------------------------------------------------

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  RECEIVED: "Recibida",
  PENDING_ADVANCE: "Pendiente anticipo",
  IN_PROGRESS: "En proceso",
  READY: "Lista p/entrega",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  ADVANCE: "Anticipo",
  FINAL: "Liquidación",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  NOT_REQUIRED: "No requiere",
  PENDING: "Pendiente",
  ISSUED: "Emitida",
  CANCELLED: "Cancelada",
};

export const REGLAS_STATUS_LABELS: Record<ReglasStatus, string> = {
  SEPARATED: "Separada",
  WITH_BLADE: "Con la cuchilla",
};

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  IN: "Entrada",
  OUT: "Salida",
};

export const ROLE_LABELS: Record<Role, string> = {
  SUPERADMIN: "Superadmin",
  OPERATOR: "Operador",
};

export const CFDI_USES = [
  { value: "G01", label: "G01 — Adquisición de mercancías" },
  { value: "G03", label: "G03 — Gastos en general" },
  { value: "I04", label: "I04 — Equipo de cómputo y accesorios" },
  { value: "P01", label: "P01 — Por definir" },
] as const;

// ---------------------------------------------------------------------------
// Business rules
// ---------------------------------------------------------------------------

export const IVA_RATE = 0.16;
export const ADVANCE_RATE = 0.5;

/** Allowed status transitions per ORDER_SCHEMA.md. */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  RECEIVED: ["PENDING_ADVANCE", "CANCELLED"],
  PENDING_ADVANCE: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["READY", "CANCELLED"],
  READY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** The five steps of the happy path, in order (CANCELLED is out-of-band). */
export const ORDER_STEPS: OrderStatus[] = [
  "RECEIVED",
  "PENDING_ADVANCE",
  "IN_PROGRESS",
  "READY",
  "DELIVERED",
];

export function computeOrderAmounts(
  quotedPrice: number,
  requiresInvoice: boolean,
) {
  const subtotal = quotedPrice;
  const ivaAmount = requiresInvoice
    ? Math.round(subtotal * IVA_RATE * 100) / 100
    : 0;
  const total = subtotal + ivaAmount;
  const advanceAmount = Math.round(total * ADVANCE_RATE * 100) / 100;
  return { subtotal, ivaAmount, total, advanceAmount };
}
