import axios from "axios";

export function getErrorMessage(
  error: unknown,
  fallback = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;

    if (data) {
      if (typeof data.message === "string" && data.message.trim() !== "") {
        return data.message;
      }

      if (data.errors && typeof data.errors === "object") {
        const messages = Object.values(data.errors)
          .filter((msg): msg is string => typeof msg === "string")
          .map((msg) => msg.trim());
        if (messages.length > 0) {
          return messages.join(" ");
        }
      }
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
