import { Bell, ShieldCheck } from "lucide-react";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { Avatar } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export function AppHeader() {
  const { displayName, initials, roleLabel } = useAuthSession();
  const { logout, isPending } = useLogout();

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            MedCare Portal
          </p>
          <h2 className="text-lg font-semibold md:text-xl">
            Chăm sóc sức khỏe số cho bệnh nhân
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label="Thông báo"
            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
            type="button"
          >
            <Bell className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-3 rounded-3xl border border-border bg-card px-3 py-2 md:flex">
            <Avatar alt={displayName} fallback={initials} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </p>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <Badge variant="info">{roleLabel}</Badge>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={logout}
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  );
}
