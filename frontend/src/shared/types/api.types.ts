export type ApiEnvelope<T> = {
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
};

export type ApiResult<T> = ApiEnvelope<T> | T;

export function unwrapApiResponse<T>(payload: ApiResult<T>): T {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    payload.data !== undefined
  ) {
    return payload.data as T;
  }

  return payload as T;
}
