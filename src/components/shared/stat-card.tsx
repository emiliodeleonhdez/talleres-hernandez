import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="min-w-41.25 max-w-60 h-25">
      <Card className="w-full h-full">
        <CardHeader className="flex gap-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground min-w-0">
            <span className="truncate uppercase">{label}</span>
            {Icon && <Icon className="size-4 shrink-0" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-semibold text-2xl text-brand">{value}</p>
        </CardContent>
      </Card>
    </div>
  );
}
