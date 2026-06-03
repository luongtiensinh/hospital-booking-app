import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { resultService } from "../services/result-service";

export function useResults() {
  return useQuery({
    queryKey: ["results"],
    queryFn: () => resultService.getPatientResults(),
  });
}

export function useDownloadResult() {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const download = async (id: string, date: string) => {
    try {
      setIsDownloading(id);
      await resultService.downloadResultPdf(id, date);
      toast.success("Tải xuống thành công");
    } catch (error) {
      console.error("[DownloadError]", error);
      toast.error("Không thể tải tệp PDF. Vui lòng thử lại sau.");
    } finally {
      setIsDownloading(null);
    }
  };

  return {
    download,
    isDownloading,
  };
}