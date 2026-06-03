import { resultApi } from "../api/result-api";

export const resultService = {
    async getPatientResults() {
        const data = await resultApi.getAll();

        // Logic sắp xếp theo timeline (mới nhất lên đầu)
        return (data || []).sort(
            (a, b) =>
                new Date((b as any).appointmentDate).getTime() -
                new Date((a as any).appointmentDate).getTime()
        );
    },

    async downloadResultPdf(id: string, fileName: string) {
        const response = await resultApi.downloadPdf(id);
        const blob =
            response.data instanceof Blob
                ? response.data
                : new Blob([response.data], { type: "application/pdf" });

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

