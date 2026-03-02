import type {
  BreakTime,
  RestaurantDetail,
  RestaurantSummary,
} from "@/types/store";
import type {
  StoreDetailDataDTO,
  StoreSearchItemDTO,
} from "@/api/dto/store.dto";

export function toRestaurantSummary(
  dto: StoreSearchItemDTO,
): RestaurantSummary {
  return {
    id: Number(dto.storeId),
    name: dto.name,
    address: dto.address,
    category: dto.category,
    rating: dto.rating,
    reviewCount: dto.reviewCount,
    distanceKm: dto.distance,
    thumbnailUrl: dto.mainImageUrl,
    isOpenNow: dto.isOpenNow,
    location: { lat: dto.latitude, lng: dto.longitude },
  };
}

export function toRestaurantDetail(dto: StoreDetailDataDTO): RestaurantDetail {
  const breakTime = toBreakTime(dto.breakStartTime, dto.breakEndTime);

  const depositRatePercent = dto.depositRate ?? 0;
  const depositRate = depositRatePercent / 100;
  const id = Number(dto.storeId);
  return {
    id,
    name: dto.storeName,
    description: dto.description,
    address: dto.address,
    phone: dto.phone,
    category: dto.category,
    rating: dto.rating,
    reviewCount: dto.reviewCount ?? 0,
    depositAmount: dto.depositAmount,
    mainImageUrl: dto.mainImageUrl ?? undefined,
    tableImageUrls: dto.tableImageUrls ?? [],
    businessHours: dto.businessHours ?? [],
    breakTime,
    isOpenNow: dto.isOpenNow,
    depositRate,
  };
}

function toBreakTime(
  start?: string | null,
  end?: string | null,
): BreakTime | undefined {
  if (!start || !end) return undefined;
  return { start, end };
}
