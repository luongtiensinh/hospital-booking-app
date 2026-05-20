import { Badge } from "@/shared/ui/badge";

const statusVariantMap = {
  confirmed: "info",
  "checked-in": "success",
  completed: "success",
  cancelled: "danger",
  pending: "warning",
  paid: "success",
  overdue: "danger",
  new: "info",
  reviewed: "neutral",
} as const;

type StatusBadgeProps = {
  status: keyof typeof statusVariantMap;
  label: string;
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return <Badge variant={statusVariantMap[status]}>{label}</Badge>;
}
