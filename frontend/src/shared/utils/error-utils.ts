import axios from "axios";

export function getErrorMessage(
  error: unknown,
  fallback = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
) {
  if (axios.isAxiosError(error)) {
    const apiMessage =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message;

    return apiMessage || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
