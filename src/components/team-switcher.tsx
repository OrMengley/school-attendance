import * as React from "react"
import { Building2, Shield, Sparkles } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60 transition-colors"
            >
              <div className="bg-primary/10 text-primary flex aspect-square size-9 items-center justify-center rounded-lg border border-primary/20 overflow-hidden shrink-0 shadow-xs">
                <img src="/vite.svg" alt="System Logo" className="h-5 w-5 object-contain" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-semibold text-foreground text-sm">
                  School Attendance
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Super Admin Portal
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              ប្រព័ន្ធគ្រប់គ្រងវត្តមាន (System Portal)
            </DropdownMenuLabel>
            <div className="p-2 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Building2 className="size-4 text-primary shrink-0" />
                <span>School Attendance System</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="size-3.5 shrink-0" />
                <span>Super Administrator</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <span>Global Administration</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
