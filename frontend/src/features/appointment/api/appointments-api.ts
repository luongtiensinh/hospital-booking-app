import { httpClient } from "@/shared/services/http-client";
import { unwrapApiResponse, type ApiResult } from "@/shared/types/api.types";
import type {
  AppointmentFilterValues,
  AppointmentSlot,
  AppointmentSummary,
  CreateAppointmentPayload,
  CreatedAppointment,
  DoctorCalendarDay,
} from "@/features/appointment/types/appointment.types";
import type { DoctorAvailability } from "@/features/doctor/types/doctor.types";

export const appointmentsApi = {
  async getUpcomingAppointments() {
    const response = await httpClient.get<ApiResult<AppointmentSummary[]>>(
      "/appointments/upcoming",
    );

    return unwrapApiResponse(response.data);
  },

  async getDoctors(filters: AppointmentFilterValues) {
    const response = await httpClient.get<ApiResult<DoctorAvailability[]>>(
      "/doctors",
      {
        params: filters,
      },
    );

    return unwrapApiResponse(response.data);
  },

  async getDoctorCalendar(doctorId: string, month: string) {
    const response = await httpClient.get<ApiResult<DoctorCalendarDay[]>>(
      `/doctors/${doctorId}/calendar`,
      {
        params: {
          month,
        },
      },
    );

    return unwrapApiResponse(response.data);
  },

  async getDoctorSlots(doctorId: string, date: string) {
    const response = await httpClient.get<ApiResult<AppointmentSlot[]>>(
      `/doctors/${doctorId}/slots`,
      {
        params: {
          date,
        },
      },
    );

    return unwrapApiResponse(response.data);
  },

  async createAppointment(payload: CreateAppointmentPayload) {
    const response = await httpClient.post<ApiResult<CreatedAppointment>>(
      "/appointments",
      payload,
    );

    return unwrapApiResponse(response.data);
  },
};
