import { resultApi } from "../api/result-api";

export const resultService = {
    async getPatientResults() {
        const { data } = await resultApi.getAll();
        // Logic sắp xếp theo timeline (mới nhất lên đầu)
        return data.sort((a, b) =>
            new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
        );
    },

    async downloadResultPdf(id: string, fileName: string) {
        const response = await resultApi.downloadPdf(id);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        const safeFileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');
        link.setAttribute('download', `Result-${safeFileName}.pdf`);

        document.body.appendChild(link);
        link.click();

        // Đảm bảo cleanup sau khi trình duyệt đã xử lý luồng download
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
};