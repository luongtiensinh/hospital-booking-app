import { invoicesApi } from "@/features/invoice/api/invoices-api";
import type { InvoiceSummary } from "@/features/invoice/types/invoice.types";

export const invoicesService = {
  async getInvoices(): Promise<InvoiceSummary[]> {
    const invoices = await invoicesApi.getInvoices();
    return invoices ?? [];
  },
};
