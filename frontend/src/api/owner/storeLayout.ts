import type { ApiResponse } from "@/types/api";
import { api } from "../axios";
import type { SeatsType } from "@/types/table";

export interface LayoutTable {
  tableId: number;
  tableNumber: string;
  minSeatCount: number;
  maxSeatCount: number;
  gridX: number;
  gridY: number;
  widthSpan: number;
  heightSpan: number;
  tableImageUrl: string | null;
  seatsType: SeatsType;
}

export interface LayoutResponse {
  layoutId: number;
  totalTableCount: number;
  gridInfo: { gridCol: number; gridRow: number };
  tables: LayoutTable[];
}

export interface CreateTableRequest {
  gridX: number;
  gridY: number;
  minSeatCount: number;
  maxSeatCount: number;
  seatsType: SeatsType;
}

export interface CreateTableResponse {
  tableId: number;
  tableNumber: string;
  minSeatCount: number;
  maxSeatCount: number;
  seatsType: string;
  gridX: number;
  gridY: number;
  tableImageUrl: string | null;
}

export const getActiveLayout = async (
  storeId: number,
): Promise<LayoutResponse | null> => {
  try {
    const res = await api.get(`/api/v1/stores/${storeId}/layouts`);
    if (res.status === 200 && res.data.isSuccess) {
      return res.data.result;
    }
    if (res.status === 204) {
      return null;
    }
    return null;
  } catch (e: any) {
    if (e.response?.status === 404) {
      console.error("가게를 찾을 수 없음");
    } else {
      console.error(e);
    }
    return null;
  }
};

export const createLayout = async (
  storeId: number,
  gridCol: number,
  gridRow: number,
) => {
  try {
    const res = await api.post<ApiResponse<LayoutResponse>>(
      `/api/v1/stores/${storeId}/layouts`,
      { gridCol, gridRow },
    );
    if (res.status === 201 || (res.status === 200 && res.data.isSuccess)) {
      return res.data.result;
    }
    throw new Error("배치도 생성 응답이 올바르지 않습니다.");
  } catch (e) {
    console.error("배치도 생성 실패:", e);
    throw e;
  }
};

export const createTable = async (
  storeId: number,
  data: CreateTableRequest,
): Promise<CreateTableResponse | null> => {
  try {
    const res = await api.post<ApiResponse<CreateTableResponse>>(
      `/api/v1/stores/${storeId}/tables`,
      data,
    );
    if ((res.status === 201 || res.status === 200) && res.data.isSuccess) {
      return res.data.result;
    }
    console.error("테이블 생성 실패 응답:", res.data);
    return null;
  } catch (e: any) {
    console.error("테이블 생성 실패:", e?.response?.data ?? e);
    return null;
  }
};

export const deleteTable = (storeId: number, tableId: number) => {
  return api.delete(`/api/v1/stores/${storeId}/tables/${tableId}`);
};
