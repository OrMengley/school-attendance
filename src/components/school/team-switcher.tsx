import * as React from "react"
import { School, Building2, MapPin, Sparkles, ChevronsUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar"
import { useUser } from "../../context/UserContext"
import API from "../../lib/axios"
import type { SchoolType } from "../../types/SchoolType"

export function TeamSwitcher() {
  const { user } = useUser()
  const [school, setSchool] = React.useState<SchoolType | null>(null)
  const { isMobile } = useSidebar()

  const fetchSchool = React.useCallback(() => {
    if (user?.school_id) {
      API.get(`/schools/${user.school_id}`)
        .then((res) => {
          setSchool(res.data)
        })
        .catch((err) => {
          console.error("Error fetching school:", err)
        })
    }
  }, [user?.school_id])

  React.useEffect(() => {
    fetchSchool()
    const handleUpdate = () => {
      fetchSchool()
    }
    window.addEventListener("school_updated", handleUpdate)
    return () => {
      window.removeEventListener("school_updated", handleUpdate)
    }
  }, [fetchSchool])

  const schoolName = school?.name || "School"
  const schoolSubtitle = school?.address || "School Admin Portal"

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
                {school?.logo_url ? (
                  <img
                    src={school.logo_url}
                    alt={schoolName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <School className="size-5 text-primary" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-semibold text-foreground text-sm">
                  {schoolName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {schoolSubtitle}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              ព័ត៌មានសាលារៀន (School Details)
            </DropdownMenuLabel>
            <div className="p-2 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Building2 className="size-4 text-primary shrink-0" />
                <span className="truncate">{schoolName}</span>
              </div>
              {school?.address && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="truncate">{school.address}</span>
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <span>School Attendance System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
