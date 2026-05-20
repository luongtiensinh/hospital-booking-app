export type ResultStatus = "new" | "reviewed";

export type ResultSummary = {
  id: string;
  examName: string;
  doctorName: string;
  reportedAt: string;
  summary: string;
  status: ResultStatus;
  statusLabel: string;
  pdfUrl?: string | null;
};
