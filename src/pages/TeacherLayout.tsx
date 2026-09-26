import {SidebarTrigger} from "../components/ui/sidebar";
import {AppSidebar} from "../components/teacher/app-sidebarTeacher";
import {Separator} from "@radix-ui/react-separator";
import {useNavigate} from "react-router-dom";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
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

const isIdSegment = (segment: string): boolean => {
    if (!segment) return false;
    if (/^(student|user|school|classroom|term|department|grade|dept)-[a-zA-Z0-9-]+$/i.test(segment)) {
        return true;
    }
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
        return true;
    }
    if (/^[0-9a-fA-F]{24}$/.test(segment)) {
        return true;
    }
    if (segment.length > 15 && /[0-9]/.test(segment) && /[-_]/.test(segment)) {
        return true;
    }
    return false;
};

export default function TeacherLayout() {
    let navigate = useNavigate();
    const location = useLocation();

    const breadcrumbItems = React.useMemo(() => {
        const rawSegments = location.pathname.split("/").filter(Boolean);
        const validSegments: { label: string; href: string }[] = [];
        let currentPath = "";

        for (const segment of rawSegments) {
            currentPath += `/${segment}`;
            if (!isIdSegment(segment)) {
                const label = segment.charAt(0).toUpperCase() + segment.slice(1);
                validSegments.push({
                    label,
                    href: currentPath,
                });
            }
        }

        return validSegments;
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen w-full">
            <AppSidebar className="w-64 shrink-0"/>

            <div className="flex flex-1 flex-col bg-gray-50">
                <header className="flex h-16 items-center gap-2 bg-white shadow-sm px-4">
                    <SidebarTrigger className="-ml-1"/>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink asChild>
                                    <Link to="/teacher">Building Your Application</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            {breadcrumbItems.map((item, i) => {
                                const isLast = i === breadcrumbItems.length - 1;
                                return (
                                    <React.Fragment key={item.href}>
                                        <BreadcrumbSeparator className="hidden md:block"/>
                                        {isLast ? (
                                            <BreadcrumbItem>
                                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                            </BreadcrumbItem>
                                        ) : (
                                            <BreadcrumbItem className="hidden md:block">
                                                <BreadcrumbLink asChild>
                                                    <Link to={item.href}>{item.label}</Link>
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </BreadcrumbList>
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
