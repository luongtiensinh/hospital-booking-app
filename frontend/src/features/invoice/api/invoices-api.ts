import { httpClient } from "@/shared/services/http-client";
import { unwrapApiResponse, type ApiResult } from "@/shared/types/api.types";
import type { InvoiceSummary } from "@/features/invoice/types/invoice.types";

export const invoicesApi = {
  async getInvoices() {
    const response = await httpClient.get<ApiResult<InvoiceSummary[]>>(
      "/invoices",
    );

    return unwrapApiResponse(response.data);
  },
};
