import type { PropsWithChildren } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { ErrorBoundary } from "@/shared/components/feedback/error-boundary";

import { queryClient } from "./query-client";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          closeButton
          expand
          position="top-right"
          richColors
          toastOptions={{
            classNames: {
              toast: "border border-border bg-card text-card-foreground shadow-lg",
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
