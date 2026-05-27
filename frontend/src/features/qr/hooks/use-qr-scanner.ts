import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

import { useQrScanStore } from "@/features/qr/store/qr-scan-store";

type UseQrScannerParams = {
  elementId: string;
  onDetected: (value: string) => void;
};

export function useQrScanner({ elementId, onDetected }: UseQrScannerParams) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const [isActive, setIsActive] = useState(false);

  const setPermission = useQrScanStore((state) => state.setPermission);
  const setStatus = useQrScanStore((state) => state.setStatus);

  const stopScanner = useCallback(async () => {
    if (!scannerRef.current) {
      return;
    }

    try {
      await scannerRef.current.stop();
    } catch (error) {
      console.warn("Stop scanner warning", error);
    }

    try {
      await scannerRef.current.clear();
    } catch (error) {
      console.warn("Clear scanner warning", error);
    }

    scannerRef.current = null;
    setIsActive(false);
    processingRef.current = false;
  }, []);

  const startScanner = useCallback(async () => {
    setPermission("requesting");
    setStatus("idle");

    try {
      const scanner = new Html5Qrcode(elementId, {
        verbose: false,
      });

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          if (processingRef.current) {
            return;
          }

          processingRef.current = true;
          setStatus("scanning");
          await stopScanner();
          onDetected(decodedText);
        },
        () => undefined,
      );

      setPermission("granted");
      setStatus("scanning");
      setIsActive(true);
    } catch (error) {
      console.error("Start scanner failed", error);
      setPermission("denied");
      setStatus("error");
      setIsActive(false);
    }
  }, [elementId, onDetected, setPermission, setStatus, stopScanner]);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  return {
    isActive,
    startScanner,
    stopScanner,
  };
}
