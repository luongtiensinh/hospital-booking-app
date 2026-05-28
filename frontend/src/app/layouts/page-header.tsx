import { Box, Group, Stack, Text } from "@mantine/core";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-end" wrap="nowrap" mb="lg">
      <Stack gap={4}>
        <Text
          size="xs"
          fw={700}
          tt="uppercase"
          style={{ letterSpacing: "0.22em", color: "var(--mantine-color-blue-6)" }}
        >
          {eyebrow}
        </Text>
        <Text
          component="h1"
          fw={700}
          style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", lineHeight: 1.2, margin: 0 }}
          c="dark.8"
        >
          {title}
        </Text>
        <Text size="sm" c="dimmed" lh={1.6} maw={640}>
          {description}
        </Text>
      </Stack>
      {actions ? (
        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
          {actions}
        </Group>
      ) : null}
    </Group>
  );
}
