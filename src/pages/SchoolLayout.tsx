
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
import React, { useEffect, useState } from "react";

export default function SchoolLayout() {
  
  const [urlPath, setUrlPath] = useState<string[]>([]);

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
      <AppSidebar className="w-64 shrink-0" />{" "}
      
      <div className="flex flex-1 flex-col bg-gray-50">
        {" "}
        
        <header className="flex h-16 items-center gap-2 bg-white shadow-sm px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink>
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>

              {urlPath.map((e, i: number) => {
                const path = e && String(e[0]).toUpperCase() + String(e).slice(1);
                return (
                  <React.Fragment key={i}>
                    <BreadcrumbSeparator className="hidden md:block" />
                    {i == urlPath.length - 1 ? (
                      <BreadcrumbItem>
                        <BreadcrumbPage>{path}</BreadcrumbPage>
                      </BreadcrumbItem>
                    ) : (
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink  asChild>
                        <Link to={path}>
                          {path}
                        </Link>
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
        <Outlet/>
        </div>
      </div>
    </div>
  );
}
