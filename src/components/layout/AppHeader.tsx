"use client";

import { CheckIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getInitials } from "@/lib/format";
import { useMockData } from "@/lib/mock-data/store";
import { ROLE_LABELS } from "@/lib/mock-data/types";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { users, currentUser, setCurrentUserId } = useMockData();

  return (
    <header
      data-slot="app-header"
      className="flex h-14 shrink-0 items-center border-b border-border bg-background px-4"
    >
      <div className="flex flex-col md:hidden">
        <span className="font-heading text-lg font-bold tracking-tight text-brand">
          FiloGes
        </span>
      </div>
      <span className="hidden font-semibold text-lg md:inline">
        Talleres Hernández
      </span>
      <Popover>
        <PopoverTrigger className="ml-auto cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <Avatar>
            <AvatarFallback className="bg-brand text-xs font-semibold text-white">
              {getInitials(currentUser.fullName)}
            </AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2">
          <p className="px-2 pb-2 pt-1 font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            Sesión (demo) — cambiar usuario
          </p>
          <div className="flex flex-col gap-1">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setCurrentUserId(user.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted",
                  user.id === currentUser.id && "bg-muted",
                )}
              >
                <Avatar className="size-7">
                  <AvatarFallback className="bg-sub-nav-bg text-2xs font-semibold text-brand">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {user.fullName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
                {user.id === currentUser.id && (
                  <CheckIcon className="size-4 shrink-0 text-gold" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </header>
  );
}
