import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function AppHeader() {
  return (
    <header
      data-slot="app-header"
      className="flex h-14 shrink-0 items-center border-b border-border bg-background px-4"
    >
      <span className="font-semibold text-[22px]">Talleres Hernández</span>
      <Button variant="ghost" className="ml-auto hover:cursor-pointer">
        <Bell className="size-4" />
      </Button>
      <Avatar className="ml-2">
        <AvatarImage src={"https://i.pravatar.cc/100"}></AvatarImage>
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </header>
  );
}
