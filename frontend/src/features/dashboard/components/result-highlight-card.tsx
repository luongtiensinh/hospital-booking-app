import { Badge, Box, Button, Card, Group, Stack, Text } from "@mantine/core";
import { FileDown } from "lucide-react";

import { formatDate } from "@/shared/utils/formatters";
import type { ResultSummary } from "@/features/result/types/result.types";

const statusColorMap: Record<string, string> = {
  new: "blue",
  reviewed: "gray",
  paid: "green",
  overdue: "red",
};

type ResultHighlightCardProps = {
  item: ResultSummary;
};

export function ResultHighlightCard({ item }: ResultHighlightCardProps) {
  return (
    <Card
      radius="lg"
      withBorder
      style={{ borderColor: "var(--mantine-color-gray-2)" }}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box>
            <Text fw={600} size="sm" c="dark.8">
              {item.examName}
            </Text>
          </Box>
          <Badge
            color={statusColorMap[item.status] ?? "blue"}
            variant="light"
            radius="sm"
            size="sm"
            style={{ flexShrink: 0 }}
          >
            {item.statusLabel}
          </Badge>
        </Group>

        <Text size="xs" c="dimmed" lh={1.6}>
          {item.summary}
        </Text>

        <Group justify="space-between" align="center">
          <Text
            size="xs"
            fw={600}
            tt="uppercase"
            style={{ letterSpacing: "0.15em" }}
            c="dimmed"
          >
            {formatDate(item.reportedAt)}
          </Text>
          {item.pdfUrl ? (
            <Button
              component="a"
              href={item.pdfUrl}
              target="_blank"
              rel="noreferrer"
              size="xs"
              variant="outline"
              radius="md"
              leftSection={<FileDown size={13} />}
            >
              PDF
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Card>
  );
}
