import {SidebarTrigger} from "../components/ui/sidebar";
import {AppSidebar} from "../components/teacher/app-sidebarTeacher";
import {Separator} from "@radix-ui/react-separator";
import {useNavigate} from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "../components/ui/breadcrumb";
import {Link, Outlet, useLocation} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Button} from "../components/ui/button";
import {KeenIcon} from "../components/ui/keenicon";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../components/ui/dropdown-menu";

export default function TeacherLayout() {
    let navigate = useNavigate();
    const [urlPath, setUrlPath] = useState < string[] > ([]);

    const url = useLocation();

    useEffect(() => {
        const paths: string[] = url.pathname.split("/");
        // "", "trash", "pat"
        paths.shift();

        setUrlPath(paths);
    }, [url]);


    return (
        <div className="flex min-h-screen w-full">
            {" "}

            <AppSidebar className="w-64 shrink-0"/>{" "}

            <div className="flex flex-1 flex-col bg-gray-50">
                {" "}

                <header className="flex h-16 items-center gap-2 bg-white shadow-sm px-4">
                    <SidebarTrigger className="-ml-1"/>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink>
                                    Building Your Application
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            {
                            urlPath.map((e, i : number) => {
                                const path = e && String(e[0]).toUpperCase() + String(e).slice(1);
                                return (
                                    <React.Fragment key={i}>
                                        <BreadcrumbSeparator className="hidden md:block"/> {
                                        i == urlPath.length - 1 ? (
                                            <BreadcrumbItem> {/* <BreadcrumbPage>{path}</BreadcrumbPage> */} </BreadcrumbItem>
                                        ) : (
                                            <BreadcrumbItem className="hidden md:block">
                                                <BreadcrumbLink asChild>
                                                    <Link to={path}>
                                                        {path} </Link>
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                        )
                                    } </React.Fragment>
                                );
                            })
                        } </BreadcrumbList>
                    </Breadcrumb>
                </header>
                {/* Main Content Area */}
                <div className="relative">
                    <Outlet/> {/* ✅ Floating buttons */}
                    <div className="sticky bottom-0 w-screen flex justify-between items-center p-4">
                        <Button variant="default" className="rounded-full shadow-lg px-3"
                            onClick={
                                () => navigate("/teacher", {replace: true})
                        }>
                            <span className="flex items-center gap-2">
                                <KeenIcon name="ki-duotone ki-home-1" className=" text-xl text-white"/>
                                ទំព័រដើម
                            </span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="rounded-full shadow-lg px-3 h-10 bg-white">
                                <span className="flex items-center gap-2">
                                    <KeenIcon name="ki-duotone ki-document" className=" text-xl text-blue-500"/>
                                    របាយការណ៍
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel className="font-bold text-center">របាយការណ៍</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem onClick={
                                    () => navigate("/teacher/reports/daily", {replace: true})
                                }>
                                    <KeenIcon name="ki-duotone ki-calendar-2
                                        " size="lg" className="text-blue-600"/>
                                    ប្រចាំថ្ងៃ</DropdownMenuItem>
                                <DropdownMenuItem onClick={
                                    () => navigate("/teacher/reports/student-summary", {replace: true})
                                }>
                                    <KeenIcon name="ki-duotone ki-user-tick
                                        " size="lg" className="text-blue-600"/>
                                    តាមរយះសិស្ស</DropdownMenuItem>
                                <DropdownMenuItem onClick={
                                    () => navigate("/teacher/reports/classroom-analytics", {replace: true})
                                }>
                                    <KeenIcon name="ki-duotone ki-delivery-door
                                        " size="lg" className="text-blue-600"/>
                                    ថ្នាក់រៀន</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="default" className="rounded-full shadow-lg px-3 bg-yellow-400"
                            onClick={
                                () => navigate("/teacher/profile", {replace: true})
                        }>
                            <span className="text-gray-700 flex items-center gap-2">
                                <KeenIcon name="ki-duotone ki-profile-circle" className=" text-xl"/>
                                រូបសង្ខេប
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
