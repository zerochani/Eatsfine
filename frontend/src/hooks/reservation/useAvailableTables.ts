import {
  getAvailableTables,
  type GetAvailableTablesParams,
} from "@/api/endpoints/reservations";
import { queryKeys } from "@/query/keys";
import { useQuery } from "@tanstack/react-query";

export function useAvailableTables(params: GetAvailableTablesParams | null) {
  return useQuery({
    queryKey: params
      ? queryKeys.reservation.availableTables(params.storeId, params)
      : ["reservation", "availableTables", "disabled"],
    enabled: !!params,
    queryFn: async () => {
      return getAvailableTables(params!);
    },
  });
}
