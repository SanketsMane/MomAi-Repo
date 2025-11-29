"use client";

import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { Menu } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6 bg-background">
      {/* Enhanced Sidebar Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 border border-transparent transition-all duration-200 rounded-lg group"
          asChild
        >
          <SidebarTrigger>
            <Menu className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          </SidebarTrigger>
        </Button>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
          <span className="text-sm font-medium text-gray-700">MOM AI</span>
        </div>
      </div>
      
      {/* Right side - can be expanded with additional controls */}
      <div className="flex-1" />
    </header>
  );
}