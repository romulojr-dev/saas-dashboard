import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { AppNavbar } from "@/components/navbar/app-navbar";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset
        className={cn(
          "[html[data-content-layout=centered]_&>*]:mx-auto",
          "[html[data-content-layout=centered]_&>*]:w-full",
          "[html[data-content-layout=centered]_&>*]:max-w-screen-2xl",
          "peer-data-[variant=inset]:border",
          "[--dashboard-header-height:--spacing(12)]",
          "min-w-0 overflow-x-clip",
        )}
      >
        <AppNavbar />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden p-4 has-data-[content-padding=false]:p-0 md:p-6 md:has-data-[content-padding=false]:p-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}