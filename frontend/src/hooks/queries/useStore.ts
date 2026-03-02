import { useMutation } from "@tanstack/react-query";
import { postMainImage, postRegisterStore } from "@/api/store";
import type { RequestMainImageDto, RequestStoreCreateDto } from "@/types/store";

// 식당 등록 훅
export const useRegisterStore = () => {
  return useMutation({
    mutationFn: (body: RequestStoreCreateDto) => postRegisterStore(body),
    onError: (error) => {
      console.error("가게 등록 실패:", error);
    },
  });
};

// 식당 대표 이미지 등록 훅
export const useMainImage = () => {
  return useMutation({
    mutationFn: ({
      storeId,
      body,
    }: {
      storeId: number;
      body: RequestMainImageDto;
    }) => postMainImage(storeId, body),
    onError: (error) => {
      console.error("대표 이미지 등록 실패:", error);
    },
  });
};
