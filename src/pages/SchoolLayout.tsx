
import { SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/school/app-sidebarSchool";
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

// Helper to detect if a URL segment is an ID / UUID / hash
const isIdSegment = (segment: string): boolean => {
  if (!segment) return false;
  // student-xxx, user-xxx, term-xxx, classroom-xxx, etc.
  if (/^(student|user|school|classroom|term|department|grade|dept)-[a-zA-Z0-9-]+$/i.test(segment)) {
    return true;
  }
  // Standard UUID format
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return true;
  }
  // MongoDB 24-character ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(segment)) {
    return true;
  }
  // Generic IDs with hyphens/numbers > 15 chars
  if (segment.length > 15 && /[0-9]/.test(segment) && /[-_]/.test(segment)) {
    return true;
  }
  return false;
};

// Friendly labels for breadcrumbs
const pathLabels: Record<string, string> = {
  school: "School",
  student: "Student",
  students: "Students",
  enrollment: "Enrollment",
  classroom: "Classroom",
  classrooms: "Classrooms",
  term: "Term",
  terms: "Terms",
  grade: "Grade",
  grades: "Grades",
  department: "Department",
  user: "User",
  users: "Users",
  parents: "Parents",
  settings: "Settings",
  dashboard: "Dashboard",
  trash: "Trash",
};

export default function SchoolLayout() {
  const location = useLocation();

  const breadcrumbItems = useMemo(() => {
    const rawSegments = location.pathname.split("/").filter(Boolean);
    const validSegments: { label: string; href: string }[] = [];
    let currentPath = "";

    let trailingId = false;
    for (const segment of rawSegments) {
      currentPath += `/${segment}`;
      if (!isIdSegment(segment)) {
        const label =
          pathLabels[segment.toLowerCase()] ||
          (segment.charAt(0).toUpperCase() + segment.slice(1));
        validSegments.push({
          label,
          href: currentPath,
        });
      } else {
        trailingId = true;
      }
    }

    // If the path ends with an ID (e.g. /school/student/:id), append "Detail" as the current page
    if (trailingId && isIdSegment(rawSegments[rawSegments.length - 1])) {
      validSegments.push({
        label: "Detail",
        href: currentPath,
      });
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
                  <Link to="/school">Building Your Application</Link>
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
        </header>
        {/* Main Content Area */}
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
