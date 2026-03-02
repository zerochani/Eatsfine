import { api } from "../axios";
import type { ApiResponse } from "@/types/api";

export interface Slot {
  time: string;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED";
  isAvailable: boolean;
  bookingId: number | null;
}

interface GetSlotsResult {
  slots: Slot[];
}

export type SlotStatus = "AVAILABLE" | "BLOCKED";

export interface UpdateSlotRequest {
  targetDate: string; 
  startTime: string;  
  status: SlotStatus;
}

export interface UpdateSlotResult {
  targetDate: string;
  startTime: string;  
  status: SlotStatus;
}

export interface PatchBreakTimeRequest {
  breakStartTime: string; 
  breakEndTime: string; 
}

export interface BookingDetailResult {
  bookerName: string;
  partySize: number;
  amount: number;
}

export const getTableSlots = (storeId: number, tableId: number, date: string) =>
  api.get<ApiResponse<GetSlotsResult>>(
    `/api/v1/stores/${storeId}/tables/${tableId}/slots`,
    { params: { date } }
  );

export const updateTableSlotStatus = (
  storeId: number,
  tableId: number,
  body: UpdateSlotRequest
) =>
  api.patch<ApiResponse<UpdateSlotResult>>(
    `/api/v1/stores/${storeId}/tables/${tableId}/slots`,
    body
  );

export const patchBreakTime = (storeId:number, body:PatchBreakTimeRequest) => {
  return api.patch(`/api/v1/stores/${storeId}/break-time`, body);
};

export const getBookingDetail = (storeId: number, tableId: number, bookingId: number) =>
  api.get<ApiResponse<BookingDetailResult>>(`/api/v1/stores/${storeId}/tables/${tableId}/slots/${bookingId}`);

export const cancelBookingByOwner = (storeId: number, tableId: number, bookingId: number) =>
  api.patch(`/api/v1/stores/${storeId}/tables/${tableId}/slots/${bookingId}/cancel`);


