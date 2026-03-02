import type {
  RequestMainImageDto,
  RequestStoreCreateDto,
  ResponseMainImageDto,
  ResponseStoreCreateDto,
} from "@/types/store";
import { api } from "./axios";
import type { ApiResponse } from "@/types/api";

export const postRegisterStore = async (
  body: RequestStoreCreateDto,
): Promise<ResponseStoreCreateDto> => {
  const { data } = await api.post<ApiResponse<ResponseStoreCreateDto>>(
    "/api/v1/stores",
    body,
  );
  return data.result;
};

export const postMainImage = async (
  storeId: number,
  body: RequestMainImageDto,
): Promise<ResponseMainImageDto> => {
  const formData = new FormData();

  formData.append("mainImage", body.mainImage);

  const { data } = await api.post<ApiResponse<ResponseMainImageDto>>(
    `/api/v1/stores/${storeId}/main-image`,
    formData,
  );
  return data.result;
};
