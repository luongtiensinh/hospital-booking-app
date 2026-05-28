import { qrApi } from "@/features/qr/api/qr-api";
import type {
  LatestAppointmentQr,
  VerifyQrPayload,
  VerifyQrResponse,
} from "@/features/qr/types/qr.types";

export const qrService = {
  async getLatestPatientQr(): Promise<LatestAppointmentQr | null> {
    return qrApi.getLatestPatientQr();
  },

  async verifyQr(payload: VerifyQrPayload): Promise<VerifyQrResponse> {
    return qrApi.verifyQr(payload);
  },
};
