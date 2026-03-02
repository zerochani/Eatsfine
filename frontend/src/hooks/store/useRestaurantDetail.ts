import { toRestaurantDetail } from "@/api/adapters/store.adapter";
import { api } from "@/api/axios";
import type { StoreDetailDataDTO } from "@/api/dto/store.dto";
import { queryKeys } from "@/query/keys";
import { useQuery } from "@tanstack/react-query";

export function useRestaurantDetail(storeId: number | null) {
  return useQuery({
    queryKey: queryKeys.restaurant.detail(storeId!),
    enabled: !!storeId,
    queryFn: async () => {
      const res = await api.get<{
        isSuccess: boolean;
        result: StoreDetailDataDTO;
      }>(`/api/v1/stores/${storeId}`);
      if (!res.data.isSuccess) {
        throw new Error("매장 상세 조회에 실패했습니다.");
      }
      return toRestaurantDetail(res.data.result);
    },
  });
}
