import { CheckIcon, XCircleIcon } from "lucide-react";
import type { Order } from "@/lib/mock-data/types";
import { ORDER_STATUS_LABELS, ORDER_STEPS } from "@/lib/mock-data/types";
import { cn } from "@/lib/utils";

const STEP_LABELS: Record<string, string> = {
  RECEIVED: "Recibida",
  PENDING_ADVANCE: "Anticipo",
  IN_PROGRESS: "En proceso",
  READY: "Lista",
  DELIVERED: "Entregada",
};

interface OrderStepperProps {
  order: Order;
}

/**
 * The order's path through the workshop, drawn like a caliper scale:
 * mono numerals, tick connectors that fill gold as the edge is honed.
 */
export function OrderStepper({ order }: OrderStepperProps) {
  if (order.status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-cancelled px-4 py-3 text-cancelled-fg">
        <XCircleIcon className="size-4 shrink-0" />
        <span className="text-sm font-medium">
          {ORDER_STATUS_LABELS.CANCELLED}
        </span>
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.indexOf(order.status);

  return (
    <ol className="flex items-start" aria-label="Progreso de la orden">
      {ORDER_STEPS.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        return (
          <li
            key={step}
            className={cn(
              "flex items-start",
              index < ORDER_STEPS.length - 1 && "flex-1",
            )}
            aria-current={current ? "step" : undefined}
          >
            <div className="flex w-12 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full font-mono text-xs transition-colors",
                  done && "bg-gold text-white",
                  current && "border-2 border-brand bg-card font-semibold text-brand",
                  !done && !current && "border border-sub-nav-border bg-card text-muted-foreground",
                )}
              >
                {done ? (
                  <CheckIcon className="size-3.5" />
                ) : (
                  `0${index + 1}`
                )}
              </span>
              <span
                className={cn(
                  "text-center text-2xs uppercase tracking-wide",
                  current
                    ? "font-semibold text-brand"
                    : "text-muted-foreground",
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
            {index < ORDER_STEPS.length - 1 && (
              <div className="mt-3.5 flex-1">
                {index === currentIndex - 1 || index === currentIndex ? (
                  // the edge being honed right now
                  <div
                    className={cn(
                      "filo-edge",
                      index < currentIndex ? "opacity-100" : "opacity-30",
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "h-px",
                      index < currentIndex ? "bg-gold" : "bg-sub-nav-border",
                    )}
                  />
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
