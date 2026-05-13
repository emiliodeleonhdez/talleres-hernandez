import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "../ui/sidebar";

export function AppSidebar() {
  return (
    // <aside
    //   data-slot="app-sidebar"
    //   className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-background"
    // >
    //   <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
    //     <span className="font-semibold text-sm">My App</span>
    //   </div>
    //   <nav className="flex-1 overflow-y-auto p-3">
    //     <p className="text-xs text-muted-foreground px-2 py-1">Navigation</p>
    //   </nav>
    // </aside>
    <Sidebar
      className={cn(
        "[--sidebar:var(--brand)] hidden md:flex  w-60 shrink-0 flex-col",
      )}
      data-slot="app-sidebar"
    >
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
