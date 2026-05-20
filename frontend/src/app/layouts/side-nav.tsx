import { NavLink } from "react-router-dom";

import { navigationItems } from "@/shared/constants/navigation";
import { cn } from "@/lib/cn";

type SideNavProps = {
  compact?: boolean;
};

export function SideNav({ compact = false }: SideNavProps) {
  return (
    <nav className={cn("flex gap-2", compact ? "flex-row" : "flex-col")}>
      {navigationItems.map(({ href, icon: Icon, title, description }) => (
        <NavLink
          key={href}
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all",
              compact
                ? "min-w-0 flex-1 justify-center px-3"
                : "w-full justify-start",
              isActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )
          }
          end={href === "/"}
          to={href}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!compact ? (
            <span className="min-w-0">
              <span className="block font-medium">{title}</span>
              <span className="block text-xs opacity-80">{description}</span>
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}
