// Thin wrappers — re-export Mantine Card and sub-components for backward compatibility
import type { PropsWithChildren } from "react";
import { Card as MantineCard, Box } from "@mantine/core";

export function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <MantineCard radius="lg" withBorder h="100%" style={{ borderColor: "var(--mantine-color-gray-2)" }}>
      {children}
    </MantineCard>
  );
}

export function CardContent({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <Box style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</Box>;
}
