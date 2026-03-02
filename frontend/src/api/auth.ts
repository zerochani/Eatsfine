import type { ApiResponse } from "@/types/api";
import type {
  RequestSignupDto,
  ResponseSignupDto,
  RequestLoginDto,
  ResponseLoginDto,
  ResponseLogoutDto,
  ResponseRefreshDto,
  RequestVerifyOwnerDto,
  ResponseVerifyOwnerDto,
} from "@/types/auth";
import { api } from "./axios";
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

export const postSignup = async (
  body: RequestSignupDto,
): Promise<ResponseSignupDto> => {
  const { data } = await api.post<ResponseSignupDto>("/api/auth/signup", body);
  return data;
};

export const postLogin = async (
  body: RequestLoginDto,
): Promise<ResponseLoginDto> => {
  const { data } = await api.post<ApiResponse<ResponseLoginDto>>(
    "/api/auth/login",
    body,
  );
  return data.result;
};

export const postLogout = async (): Promise<ResponseLogoutDto> => {
  const { data } =
    await api.delete<ApiResponse<ResponseLogoutDto>>("/api/auth/logout");
  return data.result;
};

export const clearAuth = () => {
  useAuthStore.getState().actions.logout();
};

// 로그아웃은 사용자 의도이므로 서버 실패와 무관하게 클라이언트 인증 정보를 제거
export const logout = async () => {
  try {
    await postLogout();
  } catch (e) {
    console.warn("서버 로그아웃 실패(하지만 클라이언트 로그아웃은 진행함):", e);
  } finally {
    clearAuth();
  }
};

export const postRefresh = async (): Promise<ResponseRefreshDto> => {
  // refresh는 api 인스턴스를 사용하지 않음
  // 이유: response interceptor(401 → refresh)가 다시 실행되는 것을 방지하기 위함
  const { data } = await axios.post<ApiResponse<ResponseRefreshDto>>(
    `${import.meta.env.VITE_API_URL}/api/auth/reissue`,
    {},
    {
      withCredentials: true,
      timeout: 10000,
    },
  );
  if (!data.isSuccess) {
    throw new Error(data.message || "토큰 재발급 실패");
  }
  return data.result;
};

export const patchVerifyOwner = async (
  body: RequestVerifyOwnerDto,
): Promise<ResponseVerifyOwnerDto> => {
  const { data } = await api.patch<ApiResponse<ResponseVerifyOwnerDto>>(
    "/api/users/role/owner",
    body,
  );
  return data.result;
};
