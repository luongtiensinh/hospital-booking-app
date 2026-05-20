import { useQuery } from "@tanstack/react-query";

import { invoicesService } from "@/features/invoice/services/invoices-service";

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: invoicesService.getInvoices,
  });
}
