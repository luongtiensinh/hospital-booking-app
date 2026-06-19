import { create } from "zustand";

import type { AppointmentSlot, BookingDraft, Counter } from "@/features/appointment/types/appointment.types";

type BookingStore = {
  draft: BookingDraft;
  selectedCounter: Counter | null;
  selectCounter: (counter: Counter) => void;
  selectDate: (date: string | null) => void;
  selectSlot: (slot: AppointmentSlot | null) => void;
  resetBooking: () => void;
};

const initialDraft: BookingDraft = {
  counterId: null,
  counterName: null,
  counterRoom: null,
  appointmentDate: null,
  slotId: null,
  slotLabel: null,
};

export const useBookingStore = create<BookingStore>((set) => ({
  draft: initialDraft,
  selectedCounter: null,
  selectCounter: (counter) =>
    set(() => ({
      selectedCounter: counter,
      draft: {
        counterId: counter.id,
        counterName: counter.name,
        counterRoom: counter.room,
        appointmentDate: null,
        slotId: null,
        slotLabel: null,
      },
    })),
  selectDate: (date) =>
    set((state) => ({
      draft: {
        ...state.draft,
        appointmentDate: date,
        slotId: null,
        slotLabel: null,
      },
    })),
  selectSlot: (slot) =>
    set((state) => ({
      draft: {
        ...state.draft,
        slotId: slot?.id ?? null,
        slotLabel: slot ? `${slot.startAt} - ${slot.endAt}` : null,
      },
    })),
  resetBooking: () =>
    set({
      draft: initialDraft,
      selectedCounter: null,
    }),
}));
