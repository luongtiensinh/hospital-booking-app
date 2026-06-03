import type { LucideIcon } from "lucide-react";

import { Box, Card, Stack, Text, ThemeIcon } from "@mantine/core";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
};

export function StatCard({ icon: Icon, label, value, helper }: StatCardProps) {
  return (
    <Card
      radius="lg"
      withBorder
      h="100%"
      style={{ borderColor: "var(--mantine-color-gray-2)" }}
    >
      <Stack gap="md">
        <ThemeIcon
          size={48}
          radius="md"
          variant="light"
          color="blue"
        >
          <Icon size={22} />
        </ThemeIcon>

        <Box>
          <Text size="sm" fw={500} c="dimmed">{label}</Text>
          <Text fw={800} style={{ fontSize: "1.75rem", lineHeight: 1.1 }} c="dark.8">
            {value}
          </Text>
        </Box>

        {helper && (
          <Text size="xs" c="dimmed" lh={1.5}>{helper}</Text>
        )}
      </Stack>
    </Card>
  );
}
