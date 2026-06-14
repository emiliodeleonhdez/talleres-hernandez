import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center justify-between gap-1.5 text-xs font-semibold text-muted-foreground min-w-0">
          <span className="truncate font-mono uppercase tracking-widest">
            {label}
          </span>
          {Icon && <Icon className="size-4 shrink-0 text-gold" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 px-4">
        <p className="font-heading text-2xl font-bold tracking-tight text-brand">
          {value}
        </p>
        {hint && (
          <p className="text-xs leading-none text-muted-foreground">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
