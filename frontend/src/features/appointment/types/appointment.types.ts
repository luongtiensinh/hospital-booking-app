export interface AppointmentFilterValues {
  specialty?: string;
  search?: string;
}

export interface AppointmentSlot {
  id: string;
  startAt: string; // e.g., "08:00"
  endAt: string;   // e.g., "08:30"
  isBooked: boolean;
  remainingCapacity: number;
  roomLabel?: string;
}

export interface AppointmentSummary {
  id: string;
  doctorName: string;
  specialty: string;
  appointmentAt: string; // ISO datetime
  location: string;
  status: string;
  statusLabel: string;
  qrCodeUrl?: string;
}

export interface CreatedAppointment {
  id: string;
  status: string;
  statusLabel: string;
  appointmentAt: string;
  doctorName: string;
  specialty: string;
  location: string;
}

export interface DoctorAvailability {
  id: string;
  fullName: string;
  specialty: string;
  yearsOfExperience: number;
  clinicName: string;
  avatarUrl?: string | null;
  nextAvailableAt: string; // ISO datetime
  bio?: string;
}

export interface DoctorCalendarDay {
  date: string; // YYYY-MM-DD
  availableSlots: number;
  status: 'available' | 'limited' | 'full';
}

export interface CancelAppointmentResponse {
  success: boolean;
}
