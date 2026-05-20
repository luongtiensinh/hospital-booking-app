import { httpClient } from "@/shared/services/http-client";
import { MedicalResult, CreateResultInput } from "../types";


export const resultApi = {
    getAll: () => httpClient.get<MedicalResult[]>("/medical-results"),
    getById: (id: string) => httpClient.get<MedicalResult>(`/medical-results/${id}`),
    create: (data: CreateResultInput) => httpClient.post<MedicalResult>("/medical-results", data),
    downloadPdf: (id: string) =>
        httpClient.get(`/medical-results/${id}/pdf`, { responseType: 'blob' }),
};
