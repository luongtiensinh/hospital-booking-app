import { useState } from "react";
import { CalendarRange, MapPin, XCircle } from "lucide-react";

import { formatDateTime } from "@/shared/utils/formatters";
import type { AppointmentSummary } from "@/features/appointment/types/appointment.types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";
import { useCancelAppointment } from "@/features/appointment/hooks/use-cancel-appointment";
import { ConfirmDialog } from "@/shared/components/feedback/confirm-dialog";

type NextAppointmentCardProps = {
  appointment: AppointmentSummary;
};

export function NextAppointmentCard({
  appointment,
}: NextAppointmentCardProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const cancelMutation = useCancelAppointment();

  const handleCancel = () => {
    cancelMutation.mutate(appointment.id, {
      onSuccess: () => {
        setIsCancelDialogOpen(false);
      },
    });
  };

  return (
    <>
      <Card className="h-full">
        <CardContent className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Lịch khám gần nhất
              </p>
              <h3 className="text-xl font-semibold">{appointment.doctorName}</h3>
              <p className="text-sm text-muted-foreground">
                {appointment.specialty}
              </p>
            </div>
            <StatusBadge label={appointment.statusLabel} status={appointment.status} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-secondary/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-foreground">
                <CalendarRange className="h-4 w-4" />
                Thời gian
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(appointment.appointmentAt)}
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-foreground">
                <MapPin className="h-4 w-4" />
                Địa điểm
              </div>
              <p className="text-sm text-muted-foreground">{appointment.location}</p>
            </div>
          </div>

          {appointment.status === 'confirmed' && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setIsCancelDialogOpen(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Hủy lịch khám
            </Button>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        title="Hủy lịch khám"
        description="Bạn có chắc chắn muốn hủy lịch khám này không? Thao tác này sẽ giải phóng khung giờ cho bệnh nhân khác và không thể hoàn tác."
        confirmText="Đồng ý hủy"
        cancelText="Đóng"
        isConfirming={cancelMutation.isPending}
        onConfirm={handleCancel}
        onCancel={() => setIsCancelDialogOpen(false)}
      />
    </>
  );
}
