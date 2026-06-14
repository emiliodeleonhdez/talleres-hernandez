"use client";

import { XIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/format";
import type { Customer } from "@/lib/mock-data/types";

interface ClientAvatarProps {
  client: Customer;
  onClear: () => void;
}

export function ClientAvatar({ client, onClear }: ClientAvatarProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-sub-nav-bg text-brand text-xs font-semibold">
            {getInitials(client.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium leading-none">{client.name}</span>
          <span className="text-xs text-muted-foreground">{client.phone}</span>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6 shrink-0 text-muted-foreground"
        onClick={onClear}
      >
        <XIcon className="size-3.5" />
      </Button>
    </div>
  );
}
