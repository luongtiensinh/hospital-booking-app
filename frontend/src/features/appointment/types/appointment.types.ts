export type AppointmentStatus =
  | "confirmed"
  | "checked-in"
  | "completed"
  | "cancelled";

export type AppointmentSummary = {
  id: string;
  doctorName: string;
  specialty: string;
  appointmentAt: string;
  location: string;
  status: AppointmentStatus;
  statusLabel: string;
  qrCodeUrl?: string | null;
};

export type AppointmentFilterValues = {
  search: string;
  specialty: string;
  preferredDate: string;
};

export type CalendarAvailabilityStatus = "available" | "limited" | "full";

export type DoctorCalendarDay = {
  date: string;
  availableSlots: number;
  status: CalendarAvailabilityStatus;
};

export type AppointmentSlot = {
  id: string;
  startAt: string;
  endAt: string;
  isBooked: boolean;
  remainingCapacity: number;
  roomLabel: string;
};

export type BookingDraft = {
  doctorId: string | null;
  doctorName: string | null;
  specialty: string | null;
  appointmentDate: string | null;
  slotId: string | null;
  slotLabel: string | null;
  location: string | null;
};

export type CreateAppointmentPayload = {
  doctorId: string;
  appointmentDate: string;
  slotId: string;
};

export type CreatedAppointment = {
  id: string;
  status: AppointmentStatus;
  statusLabel: string;
  appointmentAt: string;
  doctorName: string;
  specialty: string;
  location: string;
};
