import { httpClient } from "@/shared/services/http-client";

export type BackendResult = {
  id: string;
  result: string | null;
  diagnosis: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  appointment_id: string;
  appointments: {
    id: string;
    patient_id: string;
    appointment_date: string;
    status: string;
  } | null;
};

export type DoctorAppointment = {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string | null;
  slot_id: string;
  status: string;
  notes: string | null;
  profiles: { fullname: string; phone: string } | null;
};

export const resultApi = {
  /** Lấy tất cả kết quả — backend tự lọc theo role */
  getAll: async () => {
    const { data } = await httpClient.get<{
      success: boolean;
      results: BackendResult[];
    }>("/results");
    return { data: data.results ?? [] };
  },

  /** [Doctor/Admin] Lấy danh sách lịch hẹn để nhập kết quả */
  getDoctorAppointments: async () => {
    const { data } = await httpClient.get<{
      success: boolean;
      appointments: DoctorAppointment[];
    }>("/results/appointments");
    return data.appointments ?? [];
  },

  /** [Doctor/Admin] Nhập kết quả khám */
  createResult: async (payload: {
    appointmentId: string;
    diagnosis: string;
    result?: string;
  }) => {
    const { data } = await httpClient.post<{
      success: boolean;
      result: BackendResult;
    }>("/results", payload);
    return data.result;
  },

  /** Tải PDF (placeholder — backend chưa implement) */
  downloadPdf: async (_id: string) => {
    const dummyPdfContent = "%PDF-1.4 ... (MedCare Report)";
    const blob = new Blob([dummyPdfContent], { type: "application/pdf" });
    return { data: blob };
  },
};