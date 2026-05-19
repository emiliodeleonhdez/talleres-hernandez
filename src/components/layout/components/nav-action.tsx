"use client";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavActionProps {
  icon: LucideIcon;
  label: string;
  props?: React.ComponentProps<typeof Button>;
}

export function NavAction({ icon: Icon, label, props }: NavActionProps) {
  return (
    <Button
      {...props}
      className={cn(
        "h-full flex flex-col items-center justify-center gap-1 px-4 border-t-2",
        props?.className,
      )}
    >
      <Icon className={cn("size-5")} />
      <span className={cn("text-xs")}>{label}</span>
    </Button>
  );
}
