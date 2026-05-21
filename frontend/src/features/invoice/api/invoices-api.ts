import type { InvoiceSummary } from "@/features/invoice/types/invoice.types";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";

export const invoicesApi = {
  async getInvoices(): Promise<InvoiceSummary[]> {
    if (!supabaseEnabled) {
      // Fallback mock data
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
    }
    const { data, error } = await supabase.from("invoices").select("*");
    if (error) {
      console.error("Supabase getInvoices error:", error);
      return [];
    }
    // Map Supabase rows to InvoiceSummary shape
    return (data as any[]).map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      serviceName: inv.service_name,
      issuedAt: inv.issued_at,
      totalAmount: Number(inv.total_amount),
      status: inv.status,
      statusLabel: inv.status_label,
      pdfUrl: inv.pdf_url ?? null,
    }));
  },
};
