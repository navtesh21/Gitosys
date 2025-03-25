"use client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useProject from "@/hooks/use-Project";
import {
  Bot,
  CreditCard,
  LayoutDashboard,
  PlusIcon,
  Presentation,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";

export function AppSidebar() {
  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Q&A",
      url: "/qa",
      icon: Bot,
    },
    {
      title: "Meetings",
      url: "/meetings",
      icon: Presentation,
    },
  ];
  const pathname = usePathname();
  const {projects,projectId,setProjectId} = useProject()

  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader />
      <div className="flex items-center gap-2">
        <Image src="/keren_7.jpg" width={40} height={40} alt="logo" />
        {open && <span className="text-xl font-bold">Gitosys</span>}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={`flex items-center gap-2 ${item.url == pathname ? "bg-primary text-white" : ""} `}
                    >
                      <item.icon size={24} />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <div className="flex items-center gap-2" onClick={() => setProjectId(item.id)}>
                      <div
                        className={`flex size-6 items-center justify-center gap-2 rounded-sm ${item.id == projectId ? "bg-primary text-white" : ""} `}
                      >
                        <span>{item.name[0]}</span>
                      </div>
                      {item.name}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {open && (
                <SidebarMenuItem>
                  <div className="h-2"></div>
                  <Button className="w-fit" variant="outline" size="sm" onClick={() => {
                    redirect("/create");
                  }}>
                    <PlusIcon size={24} />
                    Create Project
                  </Button>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
