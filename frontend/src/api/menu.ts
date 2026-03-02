import type { ApiResponse } from "@/types/api";
import type {
  RequestMenuCreateDto,
  RequestMenuImageDto,
  ResponseMenuCreateDto,
  ResponseMenuImageDto,
} from "@/types/menus";
import { api } from "./axios";

export const postMenuCreate = async (
  storeId: number,
  body: RequestMenuCreateDto,
): Promise<ResponseMenuCreateDto> => {
  const { data } = await api.post<ApiResponse<ResponseMenuCreateDto>>(
    `/api/v1/stores/${storeId}/menus`,
    body,
  );
  return data.result;
};

export const postMenuImage = async (
  storeId: number,
  body: RequestMenuImageDto,
): Promise<ResponseMenuImageDto> => {
  const formData = new FormData();

  formData.append("image", body.image);

  const { data } = await api.post<ApiResponse<ResponseMenuImageDto>>(
    `/api/v1/stores/${storeId}/menus/images`,
    formData,
  );
  return data.result;
};
