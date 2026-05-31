import { appointmentsApi } from "@/features/appointment/api/appointments-api";
import type {
  AppointmentFilterValues,
  AppointmentSlot,
  AppointmentSummary,
  CreateAppointmentPayload,
  CreatedAppointment,
  DoctorCalendarDay,
  Counter
} from "@/features/appointment/types/appointment.types";

export const appointmentsService = {
  async getCounters(): Promise<Counter[]> {
    return appointmentsApi.getCounters();
  },

  async getUpcomingAppointments(): Promise<AppointmentSummary[]> {
    const appointments = await appointmentsApi.getUpcomingAppointments();
    return appointments ?? [];
  },

  async getAppointmentHistory(filters?: AppointmentFilterValues): Promise<AppointmentSummary[]> {
    const appointments = await appointmentsApi.getAppointmentHistory(filters);
    return appointments ?? [];
  },

  async getCalendar(
    counterId: string,
    month: string,
  ): Promise<DoctorCalendarDay[]> {
    const calendar = await appointmentsApi.getCalendar(counterId, month);
    return calendar ?? [];
  },

  async getSlots(
    counterId: string,
    date: string,
  ): Promise<AppointmentSlot[]> {
    const slots = await appointmentsApi.getSlots(counterId, date);
    return slots ?? [];
  },

  async createAppointment(
    payload: CreateAppointmentPayload,
  ): Promise<CreatedAppointment> {
    return appointmentsApi.createAppointment(payload);
  },

  async cancelAppointment(id: string, reason?: string): Promise<void> {
    return appointmentsApi.cancelAppointment(id, reason);
  }
};
