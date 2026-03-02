import { getAvailableTimes } from "@/api/endpoints/reservations";
import { queryKeys } from "@/query/keys";
import { useQuery } from "@tanstack/react-query";

export type AvailableTimesInput = {
  storeId?: string | number;
  date?: string;
  partySize?: number;
  isSplitAccepted?: boolean;
};

export function useAvailableTimes(input: AvailableTimesInput) {
  const { storeId, date, partySize, isSplitAccepted } = input;
  const enabled =
    storeId !== undefined &&
    date !== undefined &&
    partySize !== undefined &&
    isSplitAccepted !== undefined;

  return useQuery({
    queryKey: enabled
      ? queryKeys.reservation.availableTimes(storeId!, {
          date,
          partySize,
          isSplitAccepted,
        })
      : ["reservation", "availableTimes", "disabled"],
    queryFn: () =>
      getAvailableTimes({
        storeId: storeId!,
        date: date!,
        partySize: partySize!,
        isSplitAccepted: isSplitAccepted!,
      }),
    enabled,
  });
}
