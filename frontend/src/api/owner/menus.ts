import { api } from "../axios";
import type { ApiResponse } from "@/types/api";

export interface ServerMenu {
  menuId: number;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  imageUrl?: string | null;
  isSoldOut?: boolean;
}

interface GetMenusResult {
  menus: ServerMenu[];
}

export interface MenuUpdateItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageKey?: string;
}

interface MenuUpdateResult {
  menuId: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
}

interface MenuCreateItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageKey?: string;
}

interface MenuCreateResult {
  menus: {
    menuId: number;
    name: string;
    description?: string;
    price: number;
    category?: string;
    imageUrl?: string;
    imageKey?: string;
  }[];
}

export interface DeleteMenusRequest {
  menuIds: number[];
}

export interface DeleteMenusResponse {
  isSuccess: boolean;
  code: string;
  result: { deletedMenuIds: number[] };
  message: string;
}

export async function getMenus(storeId: string | number) {
  const res = await api.get<ApiResponse<GetMenusResult>>(
    `/api/v1/stores/${storeId}/menus`,
  );
  return res.data;
}

export async function createMenus(
  storeId: string | number,
  menus: MenuCreateItem[],
) {
  const res = await api.post<ApiResponse<MenuCreateResult>>(
    `/api/v1/stores/${storeId}/menus`,
    { menus },
  );
  return res.data;
}

export async function uploadMenuImage(storeId: string | number, file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post<
    ApiResponse<{ imageKey: string; imageUrl: string }>
  >(`/api/v1/stores/${storeId}/menus/images`, formData);
  return res.data;
}

export const deleteMenuImage = async (
  storeId: string,
  menuId: string,
): Promise<ApiResponse<{ deletedImageKey: string }>> => {
  try {
    const res = await api.delete<ApiResponse<{ deletedImageKey: string }>>(
      `/api/v1/stores/${storeId}/menus/${menuId}/image`,
    );
    return res.data;
  } catch (err: any) {
    console.error("deleteMenuImage error", err);
    return {
      isSuccess: false,
      code: "_MENU_IMAGE_DELETE_FAILED",
      message: err?.response?.data?.message || "이미지 삭제 실패",
      result: { deletedImageKey: "" },
    };
  }
};

export async function updateMenu(
  storeId: string | number,
  menuId: string | number,
  menu: MenuUpdateItem,
) {
  const res = await api.patch<ApiResponse<MenuUpdateResult>>(
    `/api/v1/stores/${storeId}/menus/${menuId}`,
    menu,
  );
  return res.data;
}

export const deleteMenus = async (
  storeId: string,
  menuIds: number[],
): Promise<DeleteMenusResponse> => {
  const res = await api.delete(`/api/v1/stores/${storeId}/menus`, {
    data: { menuIds },
  });

  return res.data;
};

export async function updateMenuSoldOut(
  storeId: string | number,
  menuId: string | number,
  isSoldOut: boolean,
) {
  const body = { isSoldOut };
  const res = await api.patch<
    ApiResponse<{ menuId: number; isSoldOut: boolean }>
  >(`/api/v1/stores/${storeId}/menus/${menuId}/sold-out`, body);
  return res.data;
}
