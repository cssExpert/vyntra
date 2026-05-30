"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebar } from "@/hooks/useSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, isMobileOpen, isMobile, toggle, closeMobile } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-background bg-mesh">
      {/* Sidebar */}
      <AppSidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggle={toggle}
        onClose={closeMobile}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={toggle} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1600px] p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
