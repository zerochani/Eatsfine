import { createBooking } from "@/api/endpoints/reservations";
import { useMutation } from "@tanstack/react-query";

export function useCreateBooking() {
  return useMutation({
    mutationFn: createBooking,
  });
}
