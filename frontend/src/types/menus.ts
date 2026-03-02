export type MenuCategory = "MAIN" | "SIDE" | "DRINK";

export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  category: MenuCategory;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
  price: number;
  isSoldOut: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SelectedMenu = {
  menuId: string;
  quantity: number;
};

export type ApiMenuCategory = "MAIN" | "SIDE" | "BEVERAGE" | "ALCOHOL";

export type MenuCreateItemDto = {
  name: string;
  description?: string;
  price: number;
  category: ApiMenuCategory;
  imageKey?: string;
};

export type RequestMenuCreateDto = {
  menus: MenuCreateItemDto[];
};

export type ResponseMenuCreateDto = {
  menus: MenuCreateItemDto[];
};

export type RequestMenuImageDto = {
  image: File;
};

export type ResponseMenuImageDto = {
  imageKey: string;
  imageUrl: string;
};
