import { httpClient } from "@/shared/services/http-client";
import { unwrapApiResponse, type ApiResult } from "@/shared/types/api.types";
import type { ResultSummary } from "@/features/result/types/result.types";

export const resultsApi = {
  async getResults() {
    const response = await httpClient.get<ApiResult<ResultSummary[]>>(
      "/medical-results",
    );

    return unwrapApiResponse(response.data);
  },
};
