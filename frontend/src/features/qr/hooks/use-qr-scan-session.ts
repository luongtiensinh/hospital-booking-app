import { useMemo } from "react";

import { useQrScanStore } from "@/features/qr/store/qr-scan-store";

export function useQrScanSession() {
  const permission = useQrScanStore((state) => state.permission);
  const status = useQrScanStore((state) => state.status);
  const lastProcessedValue = useQrScanStore((state) => state.lastProcessedValue);
  const lastResult = useQrScanStore((state) => state.lastResult);
  const resetScanState = useQrScanStore((state) => state.resetScanState);

  return useMemo(
    () => ({
      permission,
      status,
      lastProcessedValue,
      lastResult,
      resetScanState,
    }),
    [lastProcessedValue, lastResult, permission, resetScanState, status],
  );
}
