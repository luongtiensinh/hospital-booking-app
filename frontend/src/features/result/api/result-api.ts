import { httpClient } from "@/shared/services/http-client";
import { unwrapApiResponse, type ApiResult } from "@/shared/types/api.types";
import type { MedicalResult, CreateResultInput } from "../types";

export const resultApi = {
  async getAll() {
    // backend returns: { success: true, data: MedicalResult[] }
    const response = await httpClient.get<ApiResult<MedicalResult[]>>("/medical-results");
    return unwrapApiResponse(response.data);
  },

  async getById(id: string) {
    const response = await httpClient.get<ApiResult<MedicalResult>>(`/medical-results/${id}`);
    return unwrapApiResponse(response.data);
  },

  async create(payload: CreateResultInput) {
    const response = await httpClient.post<ApiResult<MedicalResult>>("/medical-results", payload);
    return unwrapApiResponse(response.data);
  },

  async downloadPdf(id: string) {
    // download endpoint returns application/pdf
    return httpClient.get(`/medical-results/${id}/pdf`, {
      responseType: "blob",
    } as any);
  },
};

