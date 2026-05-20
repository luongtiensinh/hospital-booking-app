import { CalendarCheck2, MapPin, Stethoscope } from "lucide-react";

import { formatDate } from "@/shared/utils/formatters";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import type { BookingDraft } from "@/features/appointment/types/appointment.types";

type BookingConfirmationCardProps = {
  draft: BookingDraft;
  canConfirm: boolean;
  isPending: boolean;
  onConfirm: () => void;
};

export function BookingConfirmationCard({
  draft,
  canConfirm,
  isPending,
  onConfirm,
}: BookingConfirmationCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Xac nhan dat lich</h3>
          <p className="text-sm text-muted-foreground">
            Tong hop thong tin bac si, ngay, gio va chuyen khoa truoc khi gui request.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl bg-secondary/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-foreground">
              <Stethoscope className="h-4 w-4" />
              Bac si
            </div>
            <p className="text-sm text-muted-foreground">
              {draft.doctorName ?? "Chua chon bac si"}
            </p>
          </div>

          <div className="rounded-2xl bg-secondary/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-foreground">
              <CalendarCheck2 className="h-4 w-4" />
              Ngay va gio
            </div>
            <p className="text-sm text-muted-foreground">
              {draft.appointmentDate ? formatDate(draft.appointmentDate) : "Chua chon ngay"}
              {draft.slotLabel ? ` • ${draft.slotLabel}` : ""}
            </p>
          </div>

          <div className="rounded-2xl bg-secondary/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-foreground">
              <MapPin className="h-4 w-4" />
              Chuyen khoa va dia diem
            </div>
            <p className="text-sm text-muted-foreground">
              {draft.specialty ?? "Chua chon chuyen khoa"}
              {draft.location ? ` • ${draft.location}` : ""}
            </p>
          </div>
        </div>

        <Button
          className="w-full"
          disabled={!canConfirm || isPending}
          onClick={onConfirm}
          size="lg"
          type="button"
        >
          {isPending ? "Dang tao lich hen..." : "Xac nhan dat lich"}
        </Button>
      </CardContent>
    </Card>
  );
}
