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

  async getDoctors(filters: AppointmentFilterValues): Promise<DoctorAvailability[]> {
    const list = [
      {
        id: "d1",
        fullName: "BS. Nguyễn Thị Lan",
        specialty: "Nội khoa",
        yearsOfExperience: 15,
        clinicName: "Phòng khám 102 - Tầng 1 - Khu A",
        avatarUrl: null,
        nextAvailableAt: "2026-05-21T08:00:00.000Z",
        bio: "Bác sĩ nội khoa với hơn 15 năm kinh nghiệm điều trị các bệnh lý mãn tính.",
      },
      {
        id: "d2",
        fullName: "BS. Phạm Minh Đức",
        specialty: "Tim mạch",
        yearsOfExperience: 12,
        clinicName: "Phòng khám 305 - Tầng 3 - Khu B",
        avatarUrl: null,
        nextAvailableAt: "2026-05-22T09:00:00.000Z",
        bio: "Chuyên gia Tim mạch giàu kinh nghiệm, tận tụy với bệnh nhân.",
      },
      {
        id: "d3",
        fullName: "BS. Hoàng Thu Trang",
        specialty: "Nhi khoa",
        yearsOfExperience: 8,
        clinicName: "Phòng khám 201 - Tầng 2 - Khu C",
        avatarUrl: null,
        nextAvailableAt: "2026-05-21T10:30:00.000Z",
        bio: "Yêu trẻ và có chuyên môn sâu về dinh dưỡng, hô hấp trẻ em.",
      },
    ];
    let result = list;
    if (filters.specialty) {
      result = result.filter((d) => d.specialty === filters.specialty);
    }
    if (filters.search) {
      result = result.filter((d) =>
        d.fullName.toLowerCase().includes(filters.search.toLowerCase()),
      );
    }
    return result;
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
