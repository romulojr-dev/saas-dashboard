import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button"
import { SearchDialog } from "@/components/search-dialog";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { cn } from "@/lib/utils";

export function AppNavbar() {
  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
        "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:overflow-hidden [html[data-navbar-style=sticky]_&]:rounded-t-[inherit] [html[data-navbar-style=sticky]_&]:bg-background/50 [html[data-navbar-style=sticky]_&]:backdrop-blur-md",
      )}
    >
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
          />
          <SearchDialog />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings />
          </Button>
          <ThemeModeToggle />
          {/* <LayoutControls />
          <ThemeSwitcher />
          <GitHubRepositoriesMenu />
          <AccountSwitcher users={users} /> */}
        </div>
      </div>
    </header>
  );
}