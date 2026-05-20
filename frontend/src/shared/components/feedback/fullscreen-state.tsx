import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

type FullscreenStateProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

export function FullscreenState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: FullscreenStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center p-6",
        className,
      )}
    >
      <div className="surface-panel max-w-xl space-y-4 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
    </div>
  );
}
