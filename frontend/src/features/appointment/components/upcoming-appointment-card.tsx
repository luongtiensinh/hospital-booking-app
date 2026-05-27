import { useState } from "react";
import { QrCode, XCircle } from "lucide-react";

import { formatDateTime } from "@/shared/utils/formatters";
import type { AppointmentSummary } from "@/features/appointment/types/appointment.types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";
import { useCancelAppointment } from "@/features/appointment/hooks/use-cancel-appointment";
import { ConfirmDialog } from "@/shared/components/feedback/confirm-dialog";

type UpcomingAppointmentCardProps = {
  appointment: AppointmentSummary;
};

export function UpcomingAppointmentCard({
  appointment,
}: UpcomingAppointmentCardProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const cancelMutation = useCancelAppointment();

  const handleCancel = () => {
    cancelMutation.mutate(appointment.id, {
      onSuccess: () => {
        setIsCancelDialogOpen(false);
      }
    });
  };

  return (
    <>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{appointment.doctorName}</h3>
              <p className="text-sm text-muted-foreground">
                {appointment.specialty} • {appointment.location}
              </p>
            </div>
            <StatusBadge label={appointment.statusLabel} status={appointment.status} />
          </div>

          <p className="text-sm leading-6 text-muted-foreground">
            {formatDateTime(appointment.appointmentAt)}
          </p>

          <div className="flex items-center gap-3 mt-2">
            {appointment.qrCodeUrl && appointment.status === 'confirmed' ? (
              <Button asChild size="sm" variant="outline">
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    appointment.qrCodeUrl,
                  )}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Mở QR check-in
                </a>
              </Button>
            ) : null}

            {appointment.status === 'confirmed' ? (
              <Button 
                size="sm" 
                variant="danger"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Hủy lịch
              </Button>
            ) : null}
          </div>
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
