import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/shared/ui/card";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
};

export function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: StatCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold">{value}</p>
        </div>
        <p className="text-sm text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
