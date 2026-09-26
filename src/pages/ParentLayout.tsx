
import { SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/parent/app-sidebarParent";
import { Separator } from "@radix-ui/react-separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Link, Outlet, useLocation } from "react-router-dom";
import React, { useMemo } from "react";
import NotificationParent from "../components/parent/notification";

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

export default function ParentLayout() {
  const location = useLocation();

  const breadcrumbItems = useMemo(() => {
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
      <AppSidebar className="w-64 shrink-0" />
      
      <div className="flex flex-1 flex-col bg-gray-50">
        <header className="flex h-16 items-center gap-2 bg-white shadow-sm px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link to="/parent">Building Your Application</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {breadcrumbItems.map((item, i) => {
                const isLast = i === breadcrumbItems.length - 1;
                return (
                  <React.Fragment key={item.href}>
                    <BreadcrumbSeparator className="hidden md:block" />
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
          <div className="w-full flex justify-end">
            <NotificationParent />
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
