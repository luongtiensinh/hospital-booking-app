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
  async getUpcomingAppointments(): Promise<AppointmentSummary[]> {
    return [
      {
        id: "app-1",
        doctorName: "BS. Nguyễn Thị Lan",
        specialty: "Nội khoa",
        appointmentAt: "2026-05-25T09:00:00.000Z",
        location: "Phòng khám 102 - Tầng 1 - Khu A",
        status: "confirmed",
        statusLabel: "Đã xác nhận",
        qrCodeUrl: "mock-qr-value-1",
      },
    ];
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
import { httpClient } from "@/shared/services/http-client";
import { unwrapApiResponse, type ApiResult } from "@/shared/types/api.types";
