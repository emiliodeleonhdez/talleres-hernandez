import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/mock-data/types";
import { ORDER_STATUS_LABELS } from "@/lib/mock-data/types";
import { cn } from "@/lib/utils";

// The four token pairs documented in CLAUDE.md are preserved verbatim;
// PENDING_ADVANCE and CANCELLED use the additive --pending/--cancelled pairs.
export const STATUS_BADGE_STYLES: Record<
  OrderStatus,
  { bg: string; fg: string; dot: string }
> = {
  RECEIVED: {
    bg: "bg-received",
    fg: "text-received-fg",
    dot: "bg-received-fg",
  },
  PENDING_ADVANCE: {
    bg: "bg-pending",
    fg: "text-pending-fg",
    dot: "bg-pending-fg",
  },
  IN_PROGRESS: { bg: "bg-warning", fg: "text-fofo", dot: "bg-fofo" },
  READY: { bg: "bg-ready", fg: "text-brand", dot: "bg-brand" },
  DELIVERED: {
    bg: "bg-delivered",
    fg: "text-delivered-fg",
    dot: "bg-delivered-fg",
  },
  CANCELLED: {
    bg: "bg-cancelled",
    fg: "text-cancelled-fg",
    dot: "bg-cancelled-fg",
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { bg, fg, dot } = STATUS_BADGE_STYLES[status];
  return (
    <Badge
      variant="outline"
      className={cn(bg, fg, "flex items-center gap-1 border-transparent", className)}
    >
      <div className={cn("size-2 rounded-full", dot)} />
      <span>{ORDER_STATUS_LABELS[status]}</span>
    </Badge>
  );
}
