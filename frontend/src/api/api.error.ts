import type { AxiosError } from "axios";
import type { ApiError, ApiResponse } from "@/types/api";

export function isApiResponse(data: unknown): data is ApiResponse<unknown> {
  return (
    typeof data === "object" &&
    data !== null &&
    ("isSuccess" in data || "success" in data) &&
    "code" in data &&
    "message" in data
  );
}

export function normalizeApiError(error: AxiosError): ApiError {
  const raw = error.response?.data;

  if (isApiResponse(raw)) {
    return {
      status: error.response?.status ?? 0,
      code: raw.code,
      message: raw.message,
    };
  }

  return {
    status: error.response?.status ?? 0,
    message: error.message || "서버와 통신 중 오류가 발생했습니다.",
  };
}
