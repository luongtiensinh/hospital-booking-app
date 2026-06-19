export type AppointmentStatus =
  | "confirmed"
  | "checked-in"
  | "completed"
  | "cancelled"
  | "expired";

export type Counter = {
  id: string;
  name: string;
  description: string;
  room: string;
  is_active: boolean;
  sort_order: number;
};

export type AppointmentSummary = {
  id: string;
  counterName: string;
  counterRoom: string;
  appointmentAt: string;
  status: AppointmentStatus;
  statusLabel: string;
  qrCodeUrl?: string | null;
  profiles?: {
    fullname: string;
    phone: string;
  } | null;
};

export type AppointmentHistory = AppointmentSummary & {
  // Add additional fields for history if needed
};

export type AppointmentFilterValues = {
  status?: AppointmentStatus | "all";
  upcoming?: boolean;
};

export type CalendarAvailabilityStatus = "available" | "limited" | "full" | "closed";

export type DoctorCalendarDay = {
  date: string;
  availableCapacity: number;
  status: CalendarAvailabilityStatus;
};

export type AppointmentSlot = {
  id: string;
  startAt: string;
  endAt: string;
  session: "morning" | "afternoon";
  capacity: number;
  remainingCapacity: number;
  isBooked: boolean;
  isPast?: boolean;
};

export type BookingDraft = {
  counterId: string | null;
  counterName: string | null;
  counterRoom: string | null;
  appointmentDate: string | null;
  slotId: string | null;
  slotLabel: string | null;
};

export type CreateAppointmentPayload = {
  counterId: string;
  appointmentDate: string;
  slotId: string;
};

export type CreatedAppointment = {
  id: string;
  status: AppointmentStatus;
  statusLabel: string;
  appointmentAt: string;
  counterName: string;
  counterRoom: string;
  qrCodeUrl?: string | null;
};
