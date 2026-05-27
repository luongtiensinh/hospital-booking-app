import { Outlet } from "react-router-dom";

import { AppHeader } from "@/app/layouts/app-header";
import { LogoMark } from "@/app/layouts/logo-mark";
import { SideNav } from "@/app/layouts/side-nav";

export function AppShell() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="hidden w-[300px] shrink-0 border-r border-white/50 px-5 py-6 lg:block">
          <div className="surface-panel sticky top-6 flex min-h-[calc(100vh-3rem)] flex-col gap-8 p-6">
            <div className="space-y-4">
              <LogoMark />
              <div className="space-y-2">
                <h1 className="text-xl font-semibold">MedCare Portal</h1>
                <p className="text-sm leading-6 text-muted-foreground">
                  Hệ thống đặt lịch khám, check-in và theo dõi kết quả y tế theo
                  chuẩn mobile-first.
                </p>
              </div>
            </div>

            <SideNav />
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-8">
            <Outlet />
          </main>
          <div className="fixed inset-x-0 bottom-0 border-t border-white/60 bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
            <SideNav compact />
          </div>
        </div>
      </div>
    </div>
  );
}
