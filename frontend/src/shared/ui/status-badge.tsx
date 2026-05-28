import { Badge } from "@mantine/core";

const statusColorMap: Record<string, string> = {
  confirmed: "blue",
  "checked-in": "green",
  completed: "green",
  cancelled: "red",
  pending: "yellow",
  paid: "green",
  overdue: "red",
  new: "blue",
  reviewed: "gray",
};

type StatusBadgeProps = {
  status: string;
  label: string;
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <Badge
      color={statusColorMap[status] ?? "blue"}
      variant="light"
      radius="sm"
      size="sm"
    >
      {label}
    </Badge>
  );
}
