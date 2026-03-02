export type ApiResponseDTO<T> = {
  success: boolean;
  code: string;
  data: T;
  message: string;
};

export type CategoryDTO =
  | "KOREAN"
  | "CHINESE"
  | "JAPANESE"
  | "WESTERN"
  | "CAFE";

export type StoreSearchItemDTO = {
  storeId: string;
  name: string;
  address: string;
  category: CategoryDTO;
  rating: number;
  reviewCount: number;
  distance: number;
  mainImageUrl: string;
  isOpenNow: boolean;
  latitude: number;
  longitude: number;
};

export type PaginationDTO = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  isFirst: boolean;
  isLast: boolean;
};

export type StoreSearchDataDTO = {
  stores: StoreSearchItemDTO[];
  pagination: PaginationDTO;
};

export type StoreSearchResponseDTO = ApiResponseDTO<StoreSearchDataDTO>;

export type DayDTO =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type BusinessHourDTO = {
  day: DayDTO;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};

export type StoreDetailDataDTO = {
  storeId: number | string;
  storeName: string;
  description: string;
  address: string;
  phone: string;
  category: CategoryDTO;
  rating: number;
  reviewCount: number | null;
  mainImageUrl?: string | null;
  tableImageUrls: string[] | null;
  businessHours: BusinessHourDTO[] | null;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  isOpenNow?: boolean;

  depositAmount: number;
  depositRate?: number | null;
};

export type StoreDetailResponseDTO = ApiResponseDTO<StoreDetailDataDTO>;
