import { httpClient } from "@/shared/services/http-client";
import { unwrapApiResponse, type ApiResult } from "@/shared/types/api.types";
import type {
  LatestAppointmentQr,
  VerifyQrPayload,
  VerifyQrResponse,
} from "@/features/qr/types/qr.types";

export const qrApi = {
  async getLatestPatientQr() {
    const response = await httpClient.get<ApiResult<LatestAppointmentQr | null>>(
      "/qr/latest",
    );

    return unwrapApiResponse(response.data);
  },

  async verifyQr(payload: VerifyQrPayload) {
    const response = await httpClient.post<ApiResult<VerifyQrResponse>>(
      "/qr/verify",
      payload,
    );

    return unwrapApiResponse(response.data);
  },
};
