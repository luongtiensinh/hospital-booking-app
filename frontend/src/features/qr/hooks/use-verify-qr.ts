import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { qrService } from "@/features/qr/services/qr-service";
import { useQrScanStore } from "@/features/qr/store/qr-scan-store";

export function useVerifyQr() {
  const queryClient = useQueryClient();
  const setStatus = useQrScanStore((state) => state.setStatus);
  const setLastResult = useQrScanStore((state) => state.setLastResult);
  const setLastProcessedValue = useQrScanStore(
    (state) => state.setLastProcessedValue,
  );

  return useMutation({
    mutationFn: qrService.verifyQr,
    onMutate: ({ value }) => {
      setStatus("verifying");
      setLastProcessedValue(value);
    },
    onSuccess: async (result) => {
      setLastResult(result);

      if (result.outcome === "valid") {
        setStatus("success");
        toast.success(result.message);
      } else if (result.outcome === "duplicate") {
        setStatus("duplicate");
        toast.warning(result.message);
      } else {
        setStatus("invalid");
        toast.error(result.message);
      }

      await queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      await queryClient.invalidateQueries({ queryKey: ["appointments", "upcoming"] });
      await queryClient.invalidateQueries({ queryKey: ["qr", "latest-patient"] });
    },
    onError: (error) => {
      console.error("QR verify failed", error);
      setStatus("error");
      toast.error("Khong the verify QR. Vui long thu lai.");
    },
  });
}
