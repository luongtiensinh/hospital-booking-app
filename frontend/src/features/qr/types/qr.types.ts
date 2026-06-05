import type { AppointmentStatus } from "@/features/appointment/types/appointment.types";

export type LatestAppointmentQr = {
  appointmentId: string;
  qrValue: string;
  expiresAt: string;
  status: "active" | "used" | "expired" | "cancelled";
  statusLabel: string;
  counterName: string;
  counterRoom: string;
  appointmentAt: string;
  appointmentStatus: AppointmentStatus;
  appointmentStatusLabel: string;
};

export type VerifyQrPayload = {
  value: string;
};

export type VerifyQrOutcome = "valid" | "duplicate" | "invalid" | "expired";

export type VerifyQrResponse = {
  outcome: VerifyQrOutcome;
  message: string;
  appointmentId?: string;
  patientName?: string;
  counterName?: string;
  counterRoom?: string;
  appointmentAt?: string;
  checkedInAt?: string;
};

export type CameraPermissionState = "unknown" | "requesting" | "granted" | "denied";

export type ScanLifecycleState =
  | "idle"
  | "scanning"
  | "verifying"
  | "success"
  | "duplicate"
  | "invalid"
  | "expired"
  | "error";

