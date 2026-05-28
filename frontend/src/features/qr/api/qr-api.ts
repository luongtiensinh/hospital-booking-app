import { httpClient } from "@/shared/services/http-client";
import type {
  LatestAppointmentQr,
  VerifyQrPayload,
  VerifyQrResponse,
} from "@/features/qr/types/qr.types";

export const qrApi = {
  async getLatestPatientQr(): Promise<LatestAppointmentQr | null> {
    const response = await httpClient.get<{
      success: boolean;
      data: LatestAppointmentQr | null;
    }>("/appointments/latest-qr");
    return response.data.data;
  },

  async verifyQr(payload: VerifyQrPayload): Promise<VerifyQrResponse> {
    const response = await httpClient.post<{
      success: boolean;
      data: VerifyQrResponse;
    }>("/appointments/verify-qr", payload);
    return response.data.data;
  },
};
