import * as React from "react"
import {
  ChartColumnBig,
  User
} from "lucide-react"
import { KeenIcon } from "../../components/ui/keenicon";
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail
} from "../ui/sidebar"


// const reportsIcon = <KeenIcon name="square-terminal" />
// Teacher-focused sidebar data
const data = {
  user: {
    name: "Teacher",
    email: "teacher@example.com",
    avatar: "/avatars/teacher.jpg"
  },
  navMain: [
    {
      title: "Reports",
      url: "/teacher/reports",
      // icon: reportsIcon,
      items: [
        {
          title: "Daily",
          url: "/teacher/reports/daily",
        },
        {
          title: "student-summary",
          url: "/teacher/reports/student-summary",
        },
        {
          title: "classroom-analytics",
          url: "/teacher/reports/classroom-analytics",
        },
        {
          title: "students",
          url: "/teacher/reports/student-profile/:studentId",
        },
        {
          title: "terms",
          url: "/teacher/reports/term",
        },
        {
          title: "alert",
          url: "/teacher/reports/alerts",
        }
      ],
    },
  ],
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
        <NavMain items={data.navMain as any} />
      </SidebarContent>
      <SidebarFooter>
        {/* You could add a small logout button or version info here */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}