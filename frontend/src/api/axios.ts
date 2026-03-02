import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { isApiResponse, normalizeApiError } from "./api.error";
import type { ApiError } from "@/types/api";
import { clearAuth, postRefresh } from "./auth";
import { useAuthStore } from "@/stores/useAuthStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string | undefined,
  timeout: 10000,
  withCredentials: true,
});

function getAccessToken() {
  return useAuthStore.getState().accessToken;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  const ownerApiPaths = ["/owner", "/stores/"];

  const isOwnerApi = ownerApiPaths.some((path) => config.url?.includes(path));

  if (isOwnerApi) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise: ReturnType<typeof postRefresh> | null = null;

api.interceptors.response.use(
  (res) => {
    const data = res.data;
    if (isApiResponse(data)) {
      const failed =
        (typeof (data as any).success === "boolean" &&
          (data as any).success === false) ||
        (typeof (data as any).isSuccess === "boolean" &&
          (data as any).isSuccess === false);

      if (failed) {
        return Promise.reject({
          status: res.status,
          code: data.code,
          message: data.message ?? "요청에 실패했습니다.",
        });
      }
    }
    return res;
  },

  async (err: AxiosError) => {
    const originalRequest = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const apiError: ApiError = normalizeApiError(err);

    if (import.meta.env.DEV) {
      console.error("[api error]", {
        status: apiError.status,
        code: apiError.code,
        message: apiError.message,
        url: err.config?.url,
        method: err.config?.method,
      });
    }

    if (apiError.status === 401 && originalRequest) {
      const isGuest = !useAuthStore.getState().accessToken;
      // 비회원이면 재발급x
      if (isGuest) {
        return Promise.reject(apiError);
      }
      // 이미 재시도한 요청이거나, 재발급 요청 자체가 실패인 경우 -> 로그아웃

      if (
        originalRequest._retry ||
        originalRequest.url?.includes("/api/auth/reissue")
      ) {
        clearAuth();
        return Promise.reject(apiError);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = postRefresh().finally(() => {
            refreshPromise = null;
          });
        }

        const result = await refreshPromise;

        if (result && result.accessToken) {
          const newAccessToken = result.accessToken;

          useAuthStore.getState().actions.login(newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return api(originalRequest);
        }

        clearAuth();
        return Promise.reject(apiError);
      } catch (refreshError) {
        console.error("토큰 재발급 실패:", refreshError);
        clearAuth();

        if (axios.isAxiosError(refreshError)) {
          return Promise.reject(normalizeApiError(refreshError));
        }

        const unknownError: ApiError = {
          status: 0,
          code: "UNKNOWN_REFRESH_ERROR",
          message: "토큰 재발급 중 알 수 없는 오류가 발생했습니다.",
        };

        return Promise.reject(unknownError);
      }
    }

    return Promise.reject(err);
  },
);
