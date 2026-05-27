export type InvoiceStatus = "pending" | "paid" | "overdue";

export type InvoiceSummary = {
  id: string;
  invoiceNumber: string;
  serviceName: string;
  issuedAt: string;
  totalAmount: number;
  status: InvoiceStatus;
  statusLabel: string;
  pdfUrl?: string | null;
};
