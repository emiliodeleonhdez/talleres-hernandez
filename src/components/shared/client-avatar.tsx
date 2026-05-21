"use client";

import { XIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Client } from "@/lib/mock-clients";

interface ClientAvatarProps {
  client: Client;
  onClear: () => void;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function ClientAvatar({ client, onClear }: ClientAvatarProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
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
