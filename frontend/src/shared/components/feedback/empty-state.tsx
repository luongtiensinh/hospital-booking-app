import type { LucideIcon } from "lucide-react";

import { Box, Card, Stack, Text, ThemeIcon } from "@mantine/core";

type EmptyStateProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
};

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: EmptyStateProps) {
  return (
    <Card radius="lg" withBorder h="100%" style={{ borderColor: "var(--mantine-color-gray-2)" }}>
      <Stack gap="md" align="flex-start">
        <ThemeIcon
          size={48}
          radius="md"
          variant="light"
          color="blue"
        >
          <Icon size={22} />
        </ThemeIcon>
        <Box>
          <Text fw={700} size="md" c="dark.8">{title}</Text>
          <Text size="sm" c="dimmed" lh={1.6}>{description}</Text>
        </Box>
        {action}
      </Stack>
    </Card>
  );
}
