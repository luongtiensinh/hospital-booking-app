import type { LucideIcon } from "lucide-react";

import { Box, Card, Group, Text, ThemeIcon } from "@mantine/core";

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
      p={{ base: "sm", sm: "md" }}
      style={{ borderColor: "var(--mantine-color-gray-2)" }}
    >
      <Group gap="xs" wrap="nowrap" align="center">
        <ThemeIcon
          size={40}
          radius="md"
          variant="light"
          color="blue"
          style={{ flexShrink: 0 }}
        >
          <Icon size={18} />
        </ThemeIcon>

        <Box style={{ minWidth: 0, flex: 1 }}>
          <Text size="xs" fw={500} c="dimmed" truncate>
            {label}
          </Text>
          <Text fw={800} style={{ fontSize: "clamp(1.1rem, 4.5vw, 1.6rem)", lineHeight: 1.1 }} c="dark.8" truncate>
            {value}
          </Text>
        </Box>
      </Group>
      {helper && (
        <Text size="xs" c="dimmed" lh={1.5} mt="xs" visibleFrom="sm">
          {helper}
        </Text>
      )}
    </Card>
  );
}
