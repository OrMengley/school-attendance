import * as React from "react"
import {
    AudioWaveform,
    Command,
    Frame,
    GalleryVerticalEnd,
    Settings2,
    SquareTerminal,
    Plus,
    Trash
} from "lucide-react"

import {NavMain} from "./nav-main"
import {NavProjects} from "./nav-projects"
import {NavUser} from "./nav-user"
import {TeamSwitcher} from "./team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail
} from "../ui/sidebar"

// This is sample data.
const data = {
    user: {
        name: "School",
        email: "school@example.com",
        avatar: "/avatars/school.jpg"
    },
    teams: [
        {
            name: "Acme Inc",
            logo: GalleryVerticalEnd,
            plan: "Enterprise"
        }, {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup"
        }, {
            name: "Evil Corp.",
            logo: Command,
            plan: "Free"
        },
    ],
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
                },
                {
                    title: "Users",
                    url: "/school/user"
                }, 
            ]
        }, 
        
        // {
        //     title: "Creator",
        //     url: "/school/creator",
        //     icon: Plus,
        //     items: [
        //         {
        //             title: "User",
        //             url: "/school/creator/user"
        //         },
        //         {
        //             title: "Term",
        //             url: "/school/creator/term"
        //         },
        //         {
        //             title: "Grade",
        //             url: "/school/creator/grade"
        //         },
        //         {
        //             title: "Classroom",
        //             url: "/school/creator/classroom"
        //         }, {
        //             title: "Student",
        //             url: "/school/creator/student"
        //         },

        //     ]
        // },
        
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
    ],
    projects: [
        {
            name: "Dashboard",
            url: "#",
            icon: Frame
        }
    ]
}

export function AppSidebar({
    ...props
} : React.ComponentProps < typeof Sidebar >) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={
                    data.teams
                }/>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={
                    data.navMain
                }/>
                <NavProjects projects={
                    data.projects
                }/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
