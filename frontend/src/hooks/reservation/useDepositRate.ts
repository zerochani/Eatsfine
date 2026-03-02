import { useRestaurantDetail } from "../store/useRestaurantDetail";

export function useDepositRate(storeId: number | string) {
  const detailQuery = useRestaurantDetail(Number(storeId));

  const rate = detailQuery.data?.depositRate ?? 0;
  return {
    rate,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    error: detailQuery.error,
  };
}
