import { api } from "../axios";

type APiResult<T> = {
  isSucceess?: boolean;
  success?: boolean;
  code?: string;
  message?: string;
  result: T;
};

export type BookingListItem = {
  bookingId: number;
  storeName: string;
  storeAddress: string;
  bookingDate: string;
  bookingTime: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  partySize: number;
  tableNumbers: string;
  amount: number;
  paymentMethod: string;
  status: string;
};

export type UserBookingsResult = {
  bookingList: BookingListItem[];
  listSize: number;
  totalPage: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
};

export async function getUserBookings(page = 1) {
  const res = await api.get<APiResult<UserBookingsResult>>(
    `/api/v1/users/bookings?page=${page}`,
  );
  return res.data.result;
}
