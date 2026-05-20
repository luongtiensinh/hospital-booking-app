import { MedicalResult, CreateResultInput } from "../types";

export const resultApi = {
  getAll: async () => {
    const list: MedicalResult[] = [
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
    return { data: list };
  },

  getById: async (id: string) => {
    const data: MedicalResult = {
      id,
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
    };
    return { data };
  },

  create: async (data: CreateResultInput) => {
    return {
      data: {
        id: `res-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        createdAt: new Date().toISOString(),
      } as MedicalResult,
    };
  },

  downloadPdf: (id: string) =>
    httpClient.get(`/medical-results/${id}/pdf`, { responseType: 'blob' }),
};
import { httpClient } from "@/shared/services/http-client";
