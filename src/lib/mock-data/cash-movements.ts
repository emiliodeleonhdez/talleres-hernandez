import { seedOrders } from "./orders";
import { seedPayments } from "./payments";
import type { CashMovement } from "./types";
import { PAYMENT_TYPE_LABELS } from "./types";

// Every order payment mirrors into the cash register (business rule
// "Cash register sync"), so these are derived from seedPayments to stay
// consistent by construction.
const paymentMovements: CashMovement[] = seedPayments.map((payment, index) => {
  const order = seedOrders.find((o) => o.id === payment.orderId);
  return {
    id: `mov-pay-${index + 1}`,
    type: "IN",
    concept: `${PAYMENT_TYPE_LABELS[payment.type]} orden ${order?.folio ?? ""}`,
    amount: payment.amount,
    method: payment.method,
    referenceId: payment.orderId,
    referenceType: "order",
    notes: null,
    createdAt: payment.paidAt,
    registeredById: payment.registeredById,
  };
});

const manualMovements: CashMovement[] = [
  {
    id: "mov-man-1",
    type: "OUT",
    concept: "Pago de luz del taller",
    amount: 1240,
    method: "TRANSFER",
    referenceId: null,
    referenceType: "expense",
    notes: "CFE bimestre may-jun",
    createdAt: "2026-06-05T16:00:00.000Z",
    registeredById: "user-1",
  },
  {
    id: "mov-man-2",
    type: "OUT",
    concept: "Compra de bandas abrasivas",
    amount: 850,
    method: "CASH",
    referenceId: null,
    referenceType: "expense",
    notes: "12 bandas grano 120 con el proveedor de La Merced",
    createdAt: "2026-06-09T15:30:00.000Z",
    registeredById: "user-2",
  },
  {
    id: "mov-man-3",
    type: "IN",
    concept: "Venta de regleta suelta",
    amount: 85,
    method: "CASH",
    referenceId: null,
    referenceType: null,
    notes: null,
    createdAt: "2026-06-10T17:00:00.000Z",
    registeredById: "user-3",
  },
  {
    id: "mov-man-4",
    type: "OUT",
    concept: "Consumibles de limpieza",
    amount: 180,
    method: "CASH",
    referenceId: null,
    referenceType: "expense",
    notes: null,
    createdAt: "2026-06-11T16:20:00.000Z",
    registeredById: "user-2",
  },
];

export const seedCashMovements: CashMovement[] = [
  ...paymentMovements,
  ...manualMovements,
].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
