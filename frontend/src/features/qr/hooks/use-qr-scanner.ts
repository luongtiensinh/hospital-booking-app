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

      const scanConfig = {
        fps: 10,
        qrbox: { width: 220, height: 220 },
      };

      const handleScanSuccess = async (decodedText: string) => {
        if (processingRef.current) {
          return;
        }

        processingRef.current = true;
        setStatus("scanning");
        await stopScanner();
        onDetected(decodedText);
      };

      const handleScanFailure = () => undefined;

      try {
        // 1. Try starting with environment-facing camera (typical for mobile rear camera)
        await scanner.start(
          { facingMode: "environment" },
          scanConfig,
          handleScanSuccess,
          handleScanFailure,
        );
      } catch (envError) {
        console.warn("Failed to start scanner with facingMode: environment. Trying user camera...", envError);
        
        try {
          // 2. Fallback to user-facing camera (typical for webcams / front cameras)
          await scanner.start(
            { facingMode: "user" },
            scanConfig,
            handleScanSuccess,
            handleScanFailure,
          );
        } catch (userError) {
          console.warn("Failed to start scanner with facingMode: user. Querying all available cameras...", userError);
          
          // 3. Fallback to querying and starting the first available camera device
          const devices = await Html5Qrcode.getCameras();
          console.log("[QrScanner] Available camera devices detected:", devices);
          const firstDevice = devices && devices[0];
          if (firstDevice) {
            await scanner.start(
              firstDevice.id,
              scanConfig,
              handleScanSuccess,
              handleScanFailure,
            );
          } else {
            // No camera device found at all, propagate the error
            throw new Error("NotFoundError: No camera devices found on this device.");
          }
        }
      }

      setPermission("granted");
      setStatus("scanning");
      setIsActive(true);
    } catch (error: any) {
      console.error("Start scanner failed", error);
      
      const errName = error instanceof Error ? error.name : String(error?.name || "");
      const errMsg = error instanceof Error ? error.message : String(error?.message || error || "");
      
      const isNotFound =
        errName === "NotFoundError" ||
        errName === "DevicesNotFoundError" ||
        errMsg.includes("NotFoundError") ||
        errMsg.includes("Requested device not found") ||
        errMsg.includes("The object can not be found here");
      
      const isPermissionDenied =
        errName === "NotAllowedError" ||
        errName === "PermissionDeniedError" ||
        errMsg.includes("NotAllowedError") ||
        errMsg.includes("PermissionDeniedError") ||
        errMsg.toLowerCase().includes("permission denied");

      if (isNotFound) {
        setPermission("not_found");
      } else if (isPermissionDenied) {
        setPermission("denied");
      } else {
        setPermission("denied"); // Default to denied for other camera startup errors
      }

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
