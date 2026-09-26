import * as React from "react"
import {
    Settings2,
    SquareTerminal,
    Trash
} from "lucide-react"

import {NavMain} from "./nav-main"
import {NavUser} from "./nav-user"
import {TeamSwitcher} from "./team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail
} from "../ui/sidebar"

const data = {
    navMain: [
        {
            title: "Viewer",
            url: "/school",
            icon: SquareTerminal,
            items: [
                {
                    title: "Dashboard",
                    url: "/school/dashboard"
                },
                {
                    title: "Department",
                    url: "/school/department"
                },
                {
                    title: "Terms",
                    url: "/school/term"
                },
                {
                    title: "Grades",
                    url: "/school/grade"
                },
                {
                    title: "Classroom",
                    url: "/school/classroom"
                }, {
                    title: "Students",
                    url: "/school/student"
                }, {
                    title: "Enrollment",
                    url: "/school/enrollment"
                },
                {
                    title: "Users",
                    url: "/school/user"
                }, 
            ]
        }, 
        {
            title: "Trash",
            url: "/school/trash",
            icon: Trash,
            items: [
                {
                    title: "User",
                    url: "/school/trash/user"
                }, {
                    title: "Department",
                    url: "/school/trash/department"
                }, {
                    title: "Term",
                    url: "/school/trash/term"
                },{
                    title: "Grade",
                    url: "/school/trash/grade"
                }, {
                    title: "Classroom",
                    url: "/school/trash/classroom"
                },
                {
                    title: "Student",
                    url: "/school/trash/student"
                },
            ]
        }, {
            title: "Settings",
            url: "/school/settings",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "/school/settings/general"
                },
            ]
        },
    ]
}

export function AppSidebar({
    ...props
} : React.ComponentProps < typeof Sidebar >) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={
                    data.navMain
                }/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
