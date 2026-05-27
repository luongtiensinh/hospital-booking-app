import { create } from "zustand";

import type { AppointmentSlot, BookingDraft } from "@/features/appointment/types/appointment.types";
import type { DoctorAvailability } from "@/features/doctor/types/doctor.types";

type BookingStore = {
  draft: BookingDraft;
  selectedDoctor: DoctorAvailability | null;
  selectDoctor: (doctor: DoctorAvailability) => void;
  selectDate: (date: string | null) => void;
  selectSlot: (slot: AppointmentSlot | null) => void;
  resetBooking: () => void;
};

const initialDraft: BookingDraft = {
  doctorId: null,
  doctorName: null,
  specialty: null,
  appointmentDate: null,
  slotId: null,
  slotLabel: null,
  location: null,
};

export const useBookingStore = create<BookingStore>((set) => ({
  draft: initialDraft,
  selectedDoctor: null,
  selectDoctor: (doctor) =>
    set(() => ({
      selectedDoctor: doctor,
      draft: {
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        specialty: doctor.specialty,
        appointmentDate: null,
        slotId: null,
        slotLabel: null,
        location: doctor.clinicName,
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
        slotLabel: slot
          ? `${slot.startAt.slice(11, 16)} - ${slot.endAt.slice(11, 16)}`
          : null,
      },
    })),
  resetBooking: () =>
    set({
      draft: initialDraft,
      selectedDoctor: null,
    }),
}));
