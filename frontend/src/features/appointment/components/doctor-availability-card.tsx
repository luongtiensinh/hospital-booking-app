import { CalendarDays, Clock3, Hospital, Stethoscope } from "lucide-react";

import { formatDateTime } from "@/shared/utils/formatters";
import type { DoctorAvailability } from "@/features/doctor/types/doctor.types";
import { Avatar } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/lib/cn";

type DoctorAvailabilityCardProps = {
  doctor: DoctorAvailability;
  isSelected: boolean;
  onSelect: (doctor: DoctorAvailability) => void;
};

export function DoctorAvailabilityCard({
  doctor,
  isSelected,
  onSelect,
}: DoctorAvailabilityCardProps) {
  const safeName = (doctor.fullName || "Bác sĩ").trim();
  const fallbackLetters = safeName.slice(0, 2).toUpperCase() || "BS";

  return (
    <Card className={cn("h-full", isSelected && "ring-4 ring-primary/15")}>
      <CardContent className="space-y-5">
        <div className="flex items-start gap-4">
          <Avatar
            alt={safeName}
            className="h-14 w-14"
            fallback={fallbackLetters}
            src={doctor.avatarUrl}
          />
          <div className="min-w-0 space-y-2">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{safeName}</h3>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">
                {doctor.yearsOfExperience ?? 0}+ nam kinh nghiem
              </Badge>
              <Badge variant="neutral">Bac si kha dung</Badge>
            </div>
          </div>
        </div>

        {doctor.bio ? (
          <div className="rounded-2xl bg-secondary/70 p-4 text-sm leading-6 text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-secondary-foreground">
              <Stethoscope className="h-4 w-4" />
              Gioi thieu nhanh
            </div>
            {doctor.bio}
          </div>
        ) : null}

        <div className="grid gap-3">
          <div className="rounded-2xl bg-secondary/70 p-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-secondary-foreground">
              <Hospital className="h-4 w-4" />
              Co so kham
            </div>
            {doctor.clinicName}
          </div>

          <div className="rounded-2xl bg-secondary/70 p-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-secondary-foreground">
              <Clock3 className="h-4 w-4" />
              Slot gan nhat
            </div>
            {doctor.nextAvailableAt
              ? formatDateTime(doctor.nextAvailableAt)
              : "Dang cap nhat"}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => onSelect(doctor)}
          type="button"
          variant={isSelected ? "default" : "outline"}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {isSelected ? "Dang duoc chon" : "Chon bac si nay"}
        </Button>
      </CardContent>
    </Card>
  );
}
