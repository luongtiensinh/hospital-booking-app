import { useMemo } from "react";

import { useBookingStore } from "@/features/appointment/hooks/use-booking-store";

export function useBookingFlow() {
  const draft = useBookingStore((state) => state.draft);
  const selectedCounter = useBookingStore((state) => state.selectedCounter);
  const selectCounter = useBookingStore((state) => state.selectCounter);
  const selectDate = useBookingStore((state) => state.selectDate);
  const selectSlot = useBookingStore((state) => state.selectSlot);
  const resetBooking = useBookingStore((state) => state.resetBooking);

  return useMemo(
    () => ({
      draft,
      selectedCounter,
      selectCounter,
      selectDate,
      selectSlot,
      resetBooking,
      canConfirm:
        Boolean(draft.counterId) &&
        Boolean(draft.appointmentDate) &&
        Boolean(draft.slotId),
    }),
    [draft, resetBooking, selectDate, selectCounter, selectSlot, selectedCounter],
  );
}
