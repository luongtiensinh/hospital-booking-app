import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  MantineProvider,
  createTheme,
  DEFAULT_THEME,
  mergeMantineTheme,
} from "@mantine/core";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/shared/components/feedback/error-boundary";
import { queryClient } from "./query-client";

import "@mantine/core/styles.css";

const theme = mergeMantineTheme(
  DEFAULT_THEME,
  createTheme({
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontFamilyMonospace: "'JetBrains Mono', monospace",
    headings: {
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      fontWeight: "700",
    },
    primaryColor: "blue",
    primaryShade: 6,
    defaultRadius: "md",
    colors: {
      // Custom blue matching #0f6fec
      blue: [
        "#eaf3fe",
        "#d5e8fd",
        "#a8cffa",
        "#78b5f7",
        "#529ef4",
        "#3a8ff2",
        "#0f6fec",
        "#0a5acc",
        "#084dae",
        "#063e8e",
      ],
    },
    radius: {
      xs: "6px",
      sm: "10px",
      md: "14px",
      lg: "20px",
      xl: "28px",
    },
    spacing: {
      xs: "8px",
      sm: "12px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    },
    components: {
      Card: {
        defaultProps: {
          radius: "lg",
          withBorder: true,
        },
        styles: {
          root: {
            borderColor: "var(--mantine-color-gray-2)",
          },
        },
      },
      Button: {
        defaultProps: {
          radius: "md",
        },
      },
      TextInput: {
        defaultProps: {
          radius: "md",
        },
      },
      PasswordInput: {
        defaultProps: {
          radius: "md",
        },
      },
      Modal: {
        defaultProps: {
          radius: "lg",
          centered: true,
        },
      },
      Badge: {
        defaultProps: {
          radius: "sm",
          variant: "light",
        },
      },
    },
  }),
);

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
