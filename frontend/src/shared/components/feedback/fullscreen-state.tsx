import type { LucideIcon } from "lucide-react";

import { Box, Center, Paper, Stack, Text, ThemeIcon } from "@mantine/core";

type FullscreenStateProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
};

export function FullscreenState({
  title,
  description,
  icon: Icon,
  action,
}: FullscreenStateProps) {
  return (
    <Center mih="100vh" p="xl">
      <Paper
        radius="xl"
        p="xl"
        withBorder
        maw={480}
        w="100%"
        ta="center"
        style={{ borderColor: "var(--mantine-color-gray-2)" }}
      >
        <Stack gap="md" align="center">
          <ThemeIcon
            size={64}
            radius="xl"
            variant="light"
            color="blue"
            style={{ animation: "spin 1.2s linear infinite" }}
          >
            <Icon size={30} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="xl" c="dark.8">{title}</Text>
            <Text size="sm" c="dimmed" lh={1.6} mt={4}>{description}</Text>
          </Box>
          {action}
        </Stack>
      </Paper>
    </Center>
  );
}
