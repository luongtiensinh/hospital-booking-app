import type { PropsWithChildren } from "react";

import { cn } from "@/lib/cn";

type PageContainerProps = PropsWithChildren<{
  className?: string;
}>;

export function PageContainer({ children, className }: PageContainerProps) {
  return <section className={cn("space-y-6", className)}>{children}</section>;
}
