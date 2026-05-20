import { useMemo } from "react";

import { useBookingStore } from "@/features/appointment/hooks/use-booking-store";

export function useBookingFlow() {
  const draft = useBookingStore((state) => state.draft);
  const selectedDoctor = useBookingStore((state) => state.selectedDoctor);
  const selectDoctor = useBookingStore((state) => state.selectDoctor);
  const selectDate = useBookingStore((state) => state.selectDate);
  const selectSlot = useBookingStore((state) => state.selectSlot);
  const resetBooking = useBookingStore((state) => state.resetBooking);

  return useMemo(
    () => ({
      draft,
      selectedDoctor,
      selectDoctor,
      selectDate,
      selectSlot,
      resetBooking,
      canConfirm:
        Boolean(draft.doctorId) &&
        Boolean(draft.appointmentDate) &&
        Boolean(draft.slotId),
    }),
    [draft, resetBooking, selectDate, selectDoctor, selectSlot, selectedDoctor],
  );
}
