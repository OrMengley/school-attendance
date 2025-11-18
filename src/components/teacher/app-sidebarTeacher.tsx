import * as React from "react"
import {
  ChartColumnBig,
  User
} from "lucide-react"
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail
} from "../ui/sidebar"
import { useUser } from "../../context/UserContext";
import type { SchoolType } from "../../types/SchoolType";
import API from "../../lib/axios"
import { Avatar } from "../ui/avatar"
// const reportsIcon = <KeenIcon name="square-terminal" />
// Teacher-focused sidebar data








export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  
  const [school, setSchool] = React.useState<SchoolType | null>(null);
  const { user } = useUser();
  const data = {
  user: {
    name: `${user?.name}`,
    email: `${user?.email}`,
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
  React.useEffect(() => {
    API.get(`/schools/${user?.school_id}`)
      .then((res) => {
        setSchool(res.data);
        console.log("school", res.data);
      })
      .catch((err) => {
        console.error("Error fetching schools:", err);
      });
  }, [])
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="p-4  flex flex-col items-center">
          <Avatar className="h-25 w-25">
            {/* <img src={data.user.avatar} alt="User Avatar" /> */}
            <img src={school?.logo_url || ""} alt="User Avatar" />
          </Avatar>
          <div className=" text-center text-gray-400">
            សលារៀន ៖​ {school?.name}
          </div>
          <div className="pt-5 flex flex-row items-center">
            <h2 className="text-lg text-gray-400">គ្រូបង្រៀន ៖</h2>
            <h2 className="text-lg font-bold">{data.user.name}</h2>
          </div>
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