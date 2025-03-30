"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  Bot, 
  Presentation, 
  PlusIcon, 
  Menu 
} from "lucide-react";

import useProject from "@/hooks/use-Project";

export function AppSidebar() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  const { projects, projectId, setProjectId } = useProject();

  const menuItems = [
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
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <Image 
          src="/keren_7.jpg" 
          width={40} 
          height={40} 
          alt="logo" 
          className="rounded-full mr-3" 
        />
        <span className="text-xl font-bold">Gitosys</span>
      </div>

      {/* Application Menu */}
      <nav className="p-4">
        <h3 className="text-xs uppercase text-muted-foreground mb-2">
          Application
        </h3>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.url}
              href={item.url}
              onClick={() => setIsSheetOpen(false)}
              className={`flex items-center p-2 rounded-md transition-colors ${
                pathname === item.url 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.icon className="mr-2" size={20} />
              {item.title}
            </Link>
          ))}
        </div>
      </nav>

      {/* Projects Section */}
      <nav className="p-4 border-t">
        <h3 className="text-xs uppercase text-muted-foreground mb-2">
          Projects
        </h3>
        <div className="space-y-1 overflow-y-auto">
          {projects?.map((project) => (
            <div 
              key={project.id}
              onClick={() => {
                setProjectId(project.id);
                setIsSheetOpen(false);
              }}
              className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                project.id === projectId 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <div className={`w-6 h-6 mr-2 flex items-center justify-center rounded-sm ${
                project.id === projectId 
                  ? "bg-primary-foreground text-primary" 
                  : "bg-muted"
              }`}>
                {project.name[0]}
              </div>
              {project.name}
            </div>
          ))}
        </div>
      </nav>

      {/* Create Project Button */}
      <div className="p-4 mt-auto border-t">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            window.location.href = "/create";
            setIsSheetOpen(false);
          }}
        >
          <PlusIcon className="mr-2" size={20} />
          Create Project
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="md:hidden fixed top-4 left-4 z-50"
          >
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 border-r h-screen">
        <SidebarContent />
      </div>
    </>
  );
}