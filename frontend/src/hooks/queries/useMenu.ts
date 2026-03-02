import { postMenuCreate, postMenuImage } from "@/api/menu";
import type { RequestMenuCreateDto, RequestMenuImageDto } from "@/types/menus";
import { useMutation } from "@tanstack/react-query";

// 메뉴 등록 훅
export const useMenuCreate = () => {
  return useMutation({
    mutationFn: ({
      storeId,
      body,
    }: {
      storeId: number;
      body: RequestMenuCreateDto;
    }) => postMenuCreate(storeId, body),
    onError: (error) => {
      console.error("메뉴 등록 실패", error);
    },
  });
};

// 메뉴 이미지 등록 훅
export const useMenuImage = () => {
  return useMutation({
    mutationFn: ({
      storeId,
      body,
    }: {
      storeId: number;
      body: RequestMenuImageDto;
    }) => postMenuImage(storeId, body),
    onError: (error) => {
      console.error("메뉴 이미지 등록 실패:", error);
    },
  });
};
