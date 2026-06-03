import { resultApi, type BackendResult } from "../api/result-api";

export const resultService = {
  async getPatientResults(): Promise<BackendResult[]> {
    const { data } = await resultApi.getAll();
    return data.sort((a, b) => {
      const dateA = a.appointments?.appointment_date ?? a.created_at;
      const dateB = b.appointments?.appointment_date ?? b.created_at;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  },

  async downloadResultPdf(id: string, fileName: string) {
    const response = await resultApi.downloadPdf(id);
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const safeFileName = fileName.replace(/[/\\?%*:|"<>]/g, "-");
    link.setAttribute("download", `Result-${safeFileName}.pdf`);

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  },
};