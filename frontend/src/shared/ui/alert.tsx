import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Alert({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white/90 p-4 text-sm text-card-foreground",
        className,
      )}
      {...props}
    />
  );
}
