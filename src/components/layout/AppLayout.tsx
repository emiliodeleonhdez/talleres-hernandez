import { SidebarProvider } from "../ui/sidebar";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { SubHeaderNav } from "./SubHeaderNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-screen overflow-hidden bg-background">
      {/* Hidden on mobile automatically (built into Sidebar) */}
      <AppSidebar />

      {/* Right column: stacks header → sub-nav → body → bottom nav (mobile) */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AppHeader />
        <SubHeaderNav />

        <main data-slot="app-body" className="flex-1 overflow-y-auto bg-muted">
          {children}
        </main>

        <AppFooter />
      </div>
    </SidebarProvider>
  );
}
