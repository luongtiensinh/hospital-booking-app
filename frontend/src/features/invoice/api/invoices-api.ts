import type { InvoiceSummary } from "@/features/invoice/types/invoice.types";

export const invoicesApi = {
  async getInvoices(): Promise<InvoiceSummary[]> {
    return [
      {
        id: "inv-1",
        invoiceNumber: "INV-2026-001",
        serviceName: "Khám chuyên khoa Nội & Xét nghiệm huyết học",
        issuedAt: "2026-05-18T11:00:00.000Z",
        totalAmount: 350000,
        status: "pending",
        statusLabel: "Chờ thanh toán",
        pdfUrl: null,
      },
      {
        id: "inv-2",
        invoiceNumber: "INV-2026-002",
        serviceName: "Khám chuyên khoa Tim mạch",
        issuedAt: "2026-05-10T15:00:00.000Z",
        totalAmount: 200000,
        status: "paid",
        statusLabel: "Đã thanh toán",
        pdfUrl: null,
      },
    ];
  },
};

