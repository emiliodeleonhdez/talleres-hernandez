import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-sub-nav-border px-6 py-12 text-center">
      <div className="grind-texture flex size-16 items-center justify-center rounded-full border border-sub-nav-border bg-sub-nav-bg">
        <Icon className="size-6 text-gold" />
      </div>
      <span className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </span>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}
