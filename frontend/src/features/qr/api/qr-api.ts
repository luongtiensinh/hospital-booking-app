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

  async verifyQr(payload: VerifyQrPayload): Promise<VerifyQrResponse> {
    return {
      outcome: "valid",
      message: "Xác thực mã QR thành công. Đã check-in lịch khám.",
      appointmentId: "app-1",
      patientName: "Nguyễn Văn Bệnh Nhân",
      doctorName: "BS. Nguyễn Thị Lan",
      specialty: "Nội khoa",
      location: "Phòng khám 102 - Tầng 1 - Khu A",
      appointmentAt: "2026-05-25T09:00:00.000Z",
      checkedInAt: new Date().toISOString(),
    };
  },
};

