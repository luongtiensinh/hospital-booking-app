import { Clock3 } from "lucide-react";

import type { AppointmentSlot } from "@/features/appointment/types/appointment.types";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/lib/cn";

type SlotSelectorProps = {
  slots: AppointmentSlot[];
  selectedSlotId: string | null;
  isLoading: boolean;
  onSelectSlot: (slot: AppointmentSlot) => void;
};

export function SlotSelector({
  slots,
  selectedSlotId,
  isLoading,
  onSelectSlot,
}: SlotSelectorProps) {
  return (
    <Card className="h-full">
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Chon gio kham</h3>
          <p className="text-sm text-muted-foreground">
            Slot da duoc dat se bi vo hieu hoa. Du lieu tu dong refetch theo chu ky.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton className="h-20" key={index} />
            ))}
          </div>
        ) : slots.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {slots.map((slot) => {
              const slotLabel = `${slot.startAt.slice(11, 16)} - ${slot.endAt.slice(11, 16)}`;
              const isSelected = selectedSlotId === slot.id;

              return (
                <button
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all",
                    slot.isBooked
                      ? "cursor-not-allowed border-border bg-secondary/40 text-muted-foreground"
                      : "border-border bg-white hover:border-primary/40 hover:bg-primary/5",
                    isSelected && "border-primary bg-primary/10 ring-4 ring-primary/15",
                  )}
                  disabled={slot.isBooked}
                  key={slot.id}
                  onClick={() => onSelectSlot(slot)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        <span className="font-semibold">{slotLabel}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{slot.roomLabel}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {slot.isBooked ? "Da dat" : `${slot.remainingCapacity} cho`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Vui long chon ngay co slot de xem lich kha dung.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
