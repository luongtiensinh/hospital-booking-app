import { QrCode } from "lucide-react";

import { formatDateTime } from "@/shared/utils/formatters";
import type { AppointmentSummary } from "@/features/appointment/types/appointment.types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";

type UpcomingAppointmentCardProps = {
  appointment: AppointmentSummary;
};

export function UpcomingAppointmentCard({
  appointment,
}: UpcomingAppointmentCardProps) {
  return (
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

        {appointment.qrCodeUrl ? (
          <Button asChild size="sm" variant="outline">
            <a href={appointment.qrCodeUrl} rel="noreferrer" target="_blank">
              <QrCode className="mr-2 h-4 w-4" />
              Mở QR check-in
            </a>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
