import { seedOrders } from "./orders";
import type { Order, OrderStatusLog } from "./types";
import { ORDER_STEPS } from "./types";

function minutesAfter(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

// Reconstructs the audit trail each seeded order must have walked to reach
// its current status, so the history panel is consistent by construction.
function logsForOrder(order: Order): OrderStatusLog[] {
  if (order.status === "CANCELLED") {
    return [
      {
        id: `log-${order.id}-cancel`,
        prevStatus: "RECEIVED",
        newStatus: "CANCELLED",
        changedAt: minutesAfter(order.createdAt, 240),
        orderId: order.id,
        changedById: order.updatedById ?? order.receivedById,
      },
    ];
  }

  const reachedIndex = ORDER_STEPS.indexOf(order.status);
  const logs: OrderStatusLog[] = [];

  for (let i = 1; i <= reachedIndex; i++) {
    const newStatus = ORDER_STEPS[i];
    let changedAt: string;
    if (newStatus === "PENDING_ADVANCE") {
      changedAt = minutesAfter(order.createdAt, 10);
    } else if (newStatus === "IN_PROGRESS") {
      changedAt = order.advancePaidAt ?? minutesAfter(order.createdAt, 30);
    } else if (newStatus === "READY") {
      changedAt = order.deliveredAt
        ? minutesAfter(order.deliveredAt, -180)
        : minutesAfter(order.estimatedDelivery, -240);
    } else {
      changedAt = order.deliveredAt ?? order.estimatedDelivery;
    }
    logs.push({
      id: `log-${order.id}-${i}`,
      prevStatus: ORDER_STEPS[i - 1],
      newStatus,
      changedAt,
      orderId: order.id,
      changedById: order.updatedById ?? order.receivedById,
    });
  }
  return logs;
}

export const seedOrderStatusLogs: OrderStatusLog[] =
  seedOrders.flatMap(logsForOrder);
