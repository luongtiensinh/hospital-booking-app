import { create } from "zustand";

import type {
  CameraPermissionState,
  ScanLifecycleState,
  VerifyQrResponse,
} from "@/features/qr/types/qr.types";

type QrScanStore = {
  permission: CameraPermissionState;
  status: ScanLifecycleState;
  lastProcessedValue: string | null;
  lastResult: VerifyQrResponse | null;
  setPermission: (permission: CameraPermissionState) => void;
  setStatus: (status: ScanLifecycleState) => void;
  setLastProcessedValue: (value: string | null) => void;
  setLastResult: (result: VerifyQrResponse | null) => void;
  resetScanState: () => void;
};

export const useQrScanStore = create<QrScanStore>((set) => ({
  permission: "unknown",
  status: "idle",
  lastProcessedValue: null,
  lastResult: null,
  setPermission: (permission) => set({ permission }),
  setStatus: (status) => set({ status }),
  setLastProcessedValue: (lastProcessedValue) => set({ lastProcessedValue }),
  setLastResult: (lastResult) => set({ lastResult }),
  resetScanState: () =>
    set({
      status: "idle",
      lastProcessedValue: null,
      lastResult: null,
    }),
}));
