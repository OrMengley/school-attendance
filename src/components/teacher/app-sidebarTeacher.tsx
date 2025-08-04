import * as React from "react"
import {
  ChartColumnBig,
  BookOpenText,
  User
} from "lucide-react"

import { NavProjects } from "./nav-projects"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail
} from "../ui/sidebar"

// Teacher-focused sidebar data
const data = {
  user: {
    name: "Teacher",
    email: "teacher@example.com",
    avatar: "/avatars/teacher.jpg"
  },
  projects: [
    {
      name: "Dashboard",
      url: "/teacher",
      icon: ChartColumnBig
    },
    {
      name: "Profile",
      url: "/teacher/profile",
      icon: User
    }
  ]
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-lg font-bold">Teacher</h2>
          <p className="text-xs text-gray-500">{data.user.email}</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        {/* You could add a small logout button or version info here */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}