"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPaletteProvider } from "@/components/layout/CommandPalette";
import { PageTransition } from "@/components/layout/PageTransition";
import { useSidebar } from "@/hooks/useSidebar";
import { useAuth } from "@/providers/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggle, closeMobile } = useSidebar();

  // The visual builder takes over the whole viewport — no app chrome.
  const isFullscreenEditor = pathname === "/cms/editor";

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show nothing while checking auth to avoid flash
  if (isLoading || !isAuthenticated) return null;

  // Full-screen editor: render the page on its own, no sidebar / topbar / padding.
  if (isFullscreenEditor) {
    return <CommandPaletteProvider>{children}</CommandPaletteProvider>;
  }

  return (
    <CommandPaletteProvider>
      <div className="flex h-screen overflow-hidden bg-background bg-mesh">
        <AppSidebar
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          onToggle={toggle}
          onClose={closeMobile}
        />

        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <Topbar onMenuClick={toggle} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <PageTransition>
              <div className="mx-auto max-w-[1600px] p-4 pb-0 sm:p-6 sm:pb-0">
                {children}
              </div>
            </PageTransition>
          </main>
        </div>
      </div>
    </CommandPaletteProvider>
  );
}
