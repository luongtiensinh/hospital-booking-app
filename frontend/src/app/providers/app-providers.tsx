import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider, createTheme } from "@mantine/core";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/shared/components/feedback/error-boundary";
import { queryClient } from "./query-client";

import "@mantine/core/styles.css";

const theme = createTheme({
  fontFamily: "'Inter', system-ui, sans-serif",
  primaryColor: "blue",
  defaultRadius: "md",
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
        <Toaster
          closeButton
          expand
          position="top-right"
          richColors
          toastOptions={{
            classNames: {
              toast:
                "border border-border bg-card text-card-foreground shadow-lg",
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
