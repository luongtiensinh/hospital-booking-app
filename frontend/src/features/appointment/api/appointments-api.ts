import type {
  AppointmentFilterValues,
  AppointmentSlot,
  AppointmentSummary,
  CreateAppointmentPayload,
  CreatedAppointment,
  DoctorCalendarDay,
} from '@/features/appointment/types/appointment.types';
import type { DoctorAvailability } from '@/features/doctor/types/doctor.types';
import { httpClient } from '@/shared/services/http-client';

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  detail?: string;
} & T;

export const appointmentsApi = {
  async getUpcomingAppointments(): Promise<AppointmentSummary[]> {
    const { data } = await httpClient.get<ApiResponse<{ appointments?: AppointmentSummary[] }>>(
      '/appointments',
      { params: { upcoming: 'true' } },
    );
    return data.appointments ?? [];
  },

  async getDoctors(filters: AppointmentFilterValues): Promise<DoctorAvailability[]> {
    const { data } = await httpClient.get<ApiResponse<{ doctors?: DoctorAvailability[] }>>(
      '/doctors',
      {
        params: {
          specialty: filters.specialty || undefined,
          search: filters.search || undefined,
        },
      },
    );
    return data.doctors ?? [];
  },

  async getDoctorCalendar(doctorId: string, month: string): Promise<DoctorCalendarDay[]> {
    const { data } = await httpClient.get<ApiResponse<{ calendar?: DoctorCalendarDay[] }>>(
      '/calendar',
      { params: { doctorId, month } },
    );
    return data.calendar ?? [];
  },

  async getDoctorSlots(doctorId: string, date: string): Promise<AppointmentSlot[]> {
    const { data } = await httpClient.get<ApiResponse<{ slots?: AppointmentSlot[] }>>(
      '/calendar/slots',
      { params: { doctorId, date } },
    );
    return data.slots ?? [];
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<CreatedAppointment> {
    const { data } = await httpClient.post<
      ApiResponse<{ appointment: CreatedAppointment }>
    >('/appointments', payload);
    return data.appointment;
  },

  async cancelAppointment(id: string): Promise<void> {
    await httpClient.delete(`/appointments/${id}`);
  },
};
