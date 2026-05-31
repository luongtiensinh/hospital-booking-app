import type {
  AppointmentFilterValues,
  AppointmentSlot,
  AppointmentSummary,
  CreateAppointmentPayload,
  CreatedAppointment,
  DoctorCalendarDay,
  Counter
} from '@/features/appointment/types/appointment.types';
import { httpClient } from '@/shared/services/http-client';

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  detail?: string;
} & T;

export const appointmentsApi = {
  async getCounters(): Promise<Counter[]> {
    const { data } = await httpClient.get<ApiResponse<{ counters?: Counter[] }>>('/counters');
    return data.counters ?? [];
  },

  async getUpcomingAppointments(): Promise<AppointmentSummary[]> {
    const { data } = await httpClient.get<ApiResponse<{ appointments?: AppointmentSummary[] }>>(
      '/appointments',
      { params: { upcoming: 'true' } },
    );
    return data.appointments ?? [];
  },

  async getAppointmentHistory(filters?: AppointmentFilterValues): Promise<AppointmentSummary[]> {
    const { data } = await httpClient.get<ApiResponse<{ appointments?: AppointmentSummary[] }>>(
      '/appointments/history',
      { params: filters },
    );
    return data.appointments ?? [];
  },

  async getCalendar(counterId: string, month: string): Promise<DoctorCalendarDay[]> {
    const { data } = await httpClient.get<ApiResponse<{ calendar?: DoctorCalendarDay[] }>>(
      '/calendar',
      { params: { counterId, month } },
    );
    return data.calendar ?? [];
  },

  async getSlots(counterId: string, date: string): Promise<AppointmentSlot[]> {
    const { data } = await httpClient.get<ApiResponse<{ slots?: AppointmentSlot[] }>>(
      '/calendar/slots',
      { params: { counterId, date } },
    );
    return data.slots ?? [];
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<CreatedAppointment> {
    const { data } = await httpClient.post<
      ApiResponse<{ appointment: CreatedAppointment }>
    >('/appointments', payload);
    return data.appointment;
  },

  async cancelAppointment(id: string, reason?: string): Promise<void> {
    await httpClient.delete(`/appointments/${id}`, {
      data: { reason }
    });
  },
};
