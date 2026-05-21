import type { MedicalResult, CreateResultInput } from "../types";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";

// Mock data used when Supabase env variables are missing
const mockResults: MedicalResult[] = [
  {
    id: "res-1",
    patientId: "mock-patient-id",
    doctorId: "d1",
    doctorName: "BS. Nguyễn Thị Lan",
    specialty: "Nội khoa",
    appointmentDate: "2026-05-18",
    diagnosis: "Rối loạn mỡ máu nhẹ / Theo dõi huyết áp",
    indicators: [
      { label: "Cholesterol toàn phần", value: "5.8", unit: "mmol/L" },
      { label: "Triglyceride", value: "1.9", unit: "mmol/L" },
      { label: "Huyết áp tâm thu", value: "128", unit: "mmHg" },
      { label: "Huyết áp tâm trương", value: "82", unit: "mmHg" },
    ],
    conclusion:
      "Bệnh nhân có chỉ số Cholesterol hơi cao. Cần điều chỉnh chế độ ăn uống, giảm chất béo động vật, tăng cường thể dục. Tái khám sau 1 tháng.",
    createdAt: "2026-05-18T10:30:00.000Z",
  },
];

export const resultApi = {
  async getAll() {
    if (!supabaseEnabled) return { data: mockResults };
    const { data, error } = await supabase.from("medical_results").select("*");
    if (error) {
      console.error("Supabase getAll results error:", error);
      return { data: [] };
    }
    return { data: data as MedicalResult[] };
  },

  async getById(id: string) {
    if (!supabaseEnabled) {
      const result = mockResults.find((r) => r.id === id);
      return { data: result as MedicalResult };
    }
    const { data, error } = await supabase
      .from("medical_results")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Supabase getById result error:", error);
      return { data: null as any };
    }
    return { data: data as MedicalResult };
  },

  async create(payload: CreateResultInput) {
    if (!supabaseEnabled) {
      const mock = {
        id: `res-${Math.random().toString(36).substr(2, 9)}`,
        ...payload,
        createdAt: new Date().toISOString(),
      } as MedicalResult;
      return { data: mock };
    }
    const { data, error } = await supabase.from("medical_results").insert(payload).single();
    if (error) {
      console.error("Supabase create result error:", error);
      throw error;
    }
    return { data: data as MedicalResult };
  },

  async downloadPdf(id: string) {
    if (!supabaseEnabled) {
      const dummyPdfContent = "%PDF-1.4 ... (Dummy MedCare Report PDF File content)";
      const blob = new Blob([dummyPdfContent], { type: "application/pdf" });
      return { data: blob };
    }
    // Assume PDFs are stored in bucket "medical-results" with filename `${id}.pdf`
    const { data, error } = await supabase.storage.from("medical-results").download(`${id}.pdf`);
    if (error) {
      console.error("Supabase download PDF error:", error);
      const dummyPdfContent = "%PDF-1.4 ... (Dummy MedCare Report PDF File content)";
      const blob = new Blob([dummyPdfContent], { type: "application/pdf" });
      return { data: blob };
    }
    return { data };
  },
};