import { SidebarProvider } from "../ui/sidebar";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-screen overflow-hidden bg-background">
      {/* Hidden on mobile automatically (built into Sidebar) */}
      <AppSidebar />

      {/* Right column: stacks header → body → footer */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AppHeader />

        <main data-slot="app-body" className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Mobile footer — hidden at md+ */}
        <AppFooter />
      </div>
    </SidebarProvider>
  );
}
