// Thin wrapper — no-op label, use Mantine's built-in label props in form components
import type { PropsWithChildren } from "react";
import { Text } from "@mantine/core";

export function Label({ children, htmlFor }: PropsWithChildren<{ htmlFor?: string }>) {
  return (
    <Text component="label" htmlFor={htmlFor} size="sm" fw={500}>
      {children}
    </Text>
  );
}
