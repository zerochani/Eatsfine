import { api } from "../axios";

export type StoreCategory =
  | "KOREAN"
  | "CHINESE"
  | "JAPANESE"
  | "WESTERN"
  | "CAFE";
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type BusinessHour = {
  day: DayOfWeek;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};

export type StoreDetail = {
  storeId: string;
  storeName: string;
  description?: string;
  address: string;
  phone?: string;
  category: StoreCategory;
  rating: number;
  reviewCount: number;
  depositAmount?: number;
  mainImageUrl?: string;
  tableImageUrls?: string[];
  businessHours: BusinessHour[];
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  isOpenNow: boolean;
};

type ApiResult<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

export async function getStoreDetail(storeId: string): Promise<StoreDetail> {
  const { data } = await api.get<ApiResult<StoreDetail>>(
    `/api/v1/stores/${storeId}`,
  );
  if (!data?.isSuccess) {
    throw {
      status: 0,
      code: data?.code,
      message: data?.message ?? "식당 상세 조회에 실패했습니다.",
    };
  }
  return data.result;
}
