import type { MenuCategory, MenuItem } from "@/types/menus";
import { api } from "../axios";

type ApiResult<T> = {
  isSuccess?: boolean;
  success?: boolean;
  code?: string;
  message?: string;
  result: T;
};

type MenuDto = {
  menuId: number;
  name: string;
  description?: string;
  price: number;
  category: MenuCategory | string;
  imageUrl?: string;
  isSoldOut: boolean;
};

type MenuListResult = {
  menus: MenuDto[];
};

export async function getMenus(storeId: string): Promise<MenuItem[]> {
  const { data } = await api.get<ApiResult<MenuListResult>>(
    `/api/v1/stores/${storeId}/menus`,
  );
  if (!data?.isSuccess) {
    throw {
      status: 0,
      code: data?.code,
      message: data?.message ?? "메뉴 목록 조회에 실패했습니다.",
    };
  }
  const menus = data.result?.menus ?? [];

  return menus.map((m) => ({
    id: String(m.menuId),
    restaurantId: String(storeId),
    name: m.name,
    category: m.category as MenuCategory,
    description: m.description ?? "",
    imageUrl: m.imageUrl ?? "",
    price: m.price,
    isSoldOut: m.isSoldOut,
    isActive: true, //서버에 없어서 임시로 달아둠.
  }));
}
