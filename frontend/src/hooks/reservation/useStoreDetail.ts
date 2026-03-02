import { getStoreDetail } from "@/api/endpoints/stores";
import { queryKeys } from "@/query/keys";
import { useQuery } from "@tanstack/react-query";

export function useStoreDetail(storeId?: string | number) {
  return useQuery({
    queryKey: storeId
      ? queryKeys.restaurant.detail(storeId)
      : ["restaurant", "detail", "disabled"],
    queryFn: () => getStoreDetail(String(storeId)),
    enabled: !!storeId,
  });
}
