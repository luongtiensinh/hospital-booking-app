import { useQuery } from "@tanstack/react-query";

import { qrService } from "@/features/qr/services/qr-service";

export function useLatestPatientQr() {
  return useQuery({
    queryKey: ["qr", "latest-patient"],
    queryFn: qrService.getLatestPatientQr,
    refetchInterval: 30000,
  });
}
