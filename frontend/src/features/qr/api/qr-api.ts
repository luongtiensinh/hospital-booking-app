import type {
  LatestAppointmentQr,
  VerifyQrPayload,
  VerifyQrResponse,
} from "@/features/qr/types/qr.types";

export const qrApi = {
  async getLatestPatientQr(): Promise<LatestAppointmentQr | null> {
    return {
      appointmentId: "app-1",
      qrValue: "mock-qr-value-1",
      expiresAt: "2026-05-25T10:00:00.000Z",
      status: "active",
      statusLabel: "Còn hiệu lực",
      doctorName: "BS. Nguyễn Thị Lan",
      specialty: "Nội khoa",
      appointmentAt: "2026-05-25T09:00:00.000Z",
      location: "Phòng khám 102 - Tầng 1 - Khu A",
      appointmentStatus: "confirmed",
      appointmentStatusLabel: "Đã xác nhận",
    };
  },

  async verifyQr(payload: VerifyQrPayload) {
    const response = await httpClient.post<ApiResult<VerifyQrResponse>>(
      "/qr/verify",
      payload,
    );

    return unwrapApiResponse(response.data);
  },
};
import { httpClient } from "@/shared/services/http-client";
import { unwrapApiResponse, type ApiResult } from "@/shared/types/api.types";
