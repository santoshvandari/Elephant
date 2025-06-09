import { AppSidebar } from "../../components/app-sidebar";
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar";
import { DashboardHeader } from "../../components/dashboard-header";
import ConvexClientProvider from "./ConvexProvider";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
