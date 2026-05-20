import { resultsApi } from "@/features/result/api/results-api";
import type { ResultSummary } from "@/features/result/types/result.types";

export const resultsService = {
  async getResults(): Promise<ResultSummary[]> {
    const results = await resultsApi.getResults();
    return results ?? [];
  },
};
