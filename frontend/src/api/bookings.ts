import { api } from "./axios";

export type BookingStatus = "예약 확정" | "방문 완료" | "취소됨";

export type ApiBookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELED";

export interface Booking {
  bookingId: number;
  storeName: string;
  storeAddress: string;
  bookingDate: string;
  bookingTime: string;
  partySize: number;
  amount: number;
  paymentMethod: string;
  status: ApiBookingStatus;
}

export interface BookingResponse {
  bookingList: Booking[];
  listSize: number;
  totalPage: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
}


export const getBookings = async (status?: ApiBookingStatus, page: number = 1): Promise<BookingResponse> => {
  const params: any = { page };
  if (status) params.status = status;

  const response = await api.get<{ result: BookingResponse }>("/api/v1/users/bookings", { params });
  return response.data.result as BookingResponse;
};  

export const cancelBooking = async (bookingId: number, reason: string = "사용자 취소") => {
  const response = await api.patch(`/api/v1/bookings/${bookingId}/cancel`, { reason });
  return response.data;
};
