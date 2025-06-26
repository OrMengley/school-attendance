import * as React from "react"
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Plus,
  Trash,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "./ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Viewer",
      url: "/view",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/view/dashboard",
        },
        {
          title: "School",
          url: "/view/school",
        },
        {
          title: "Classroom",
          url: "/view/classroom",
        },
        {
          title: "Users",
          url: "/view/user",
        },
      ],
    },
    {
      title: "Creator",
      url: "/creator",
      icon: Plus,
      items: [
        {
          title: "Schools",
          url:"/creator/school",
        },
        {
          title: "Users",
          url: "/creator/user",
        },
        {
          title: "Classroom",
          url: "/creator/classroom",
        },
      ],
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash,
      items: [
        {
          title: "Schools",
          url: "#",
        },
        {
          title: "Users",
          url: "#",
        },
        {
          title: "Classes",
          url: "#",
        }
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "#",
      icon: Frame,
    },
    {
      name: "Terms",
      url: "#",
      icon: Frame,
    },
    {
      name: "Classes",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Users",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
