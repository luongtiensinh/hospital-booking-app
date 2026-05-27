import { appointmentsApi } from "@/features/appointment/api/appointments-api";
import type {
  AppointmentFilterValues,
  AppointmentSlot,
  AppointmentSummary,
  CreateAppointmentPayload,
  CreatedAppointment,
  DoctorCalendarDay,
} from "@/features/appointment/types/appointment.types";
import type { DoctorAvailability } from "@/features/doctor/types/doctor.types";

export const appointmentsService = {
  async getUpcomingAppointments(): Promise<AppointmentSummary[]> {
    const appointments = await appointmentsApi.getUpcomingAppointments();
    return appointments ?? [];
  },

  async getDoctors(
    filters: AppointmentFilterValues,
  ): Promise<DoctorAvailability[]> {
    const doctors = await appointmentsApi.getDoctors(filters);
    return doctors ?? [];
  },

  async getDoctorCalendar(
    doctorId: string,
    month: string,
  ): Promise<DoctorCalendarDay[]> {
    const calendar = await appointmentsApi.getDoctorCalendar(doctorId, month);
    return calendar ?? [];
  },

  async getDoctorSlots(
    doctorId: string,
    date: string,
  ): Promise<AppointmentSlot[]> {
    const slots = await appointmentsApi.getDoctorSlots(doctorId, date);
    return slots ?? [];
  },

  async createAppointment(
    payload: CreateAppointmentPayload,
  ): Promise<CreatedAppointment> {
    return appointmentsApi.createAppointment(payload);
  },
};
