"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const location = useLocation()

  // Function to check if a menu item is active
  const isMenuItemActive = (itemUrl: string, subItems?: { title: string; url: string }[]) => {
    const currentPath = location.pathname

    if (currentPath === itemUrl) return true

    if (subItems) {
      return subItems.some(subItem => currentPath === subItem.url)
    }

    return false
  }

  // Function to check if a sub-item is active
  const isSubItemActive = (subItemUrl: string) => {
    return location.pathname === subItemUrl
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin Dashboard</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = isMenuItemActive(item.url, item.items)

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive || item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} data-active={isActive}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubActive = isSubItemActive(subItem.url)
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            data-active={isSubActive}
                            className={isSubActive ? "bg-primary/10 text-primary font-medium" : ""}
                          >
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
