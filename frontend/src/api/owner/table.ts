import { api } from "../axios";
import type { ApiResponse } from "@/types/api";
import type { AxiosProgressEvent } from "axios";

export interface UploadTableImageResult {
  tableId: number;
  tableImageUrl: string;
}

interface DeleteTableImageResult {
  tableId: number;
}

export interface PatchTableRequest {
  tableNumber?: string;    
  minSeatCount?: number;
  maxSeatCount?: number;
  seatsType?: 'GENERAL' | 'WINDOW' | 'ROOM' | 'BAR' | 'OUTDOOR';
}

export interface UpdatedTable {
  tableId: number;
  tableNumber: string;
  minSeatCount: number;
  maxSeatCount: number;
  seatsType: string;
}

export const uploadTableImage = (
  storeId: number,
  tableId: number,
  file: File,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
  const formData = new FormData();
  formData.append("tableImage", file);

  return api.post<ApiResponse<UploadTableImageResult>>(
    `/api/v1/stores/${storeId}/tables/${tableId}/table-image`,
    formData,
    {onUploadProgress,}
  );
};

export const deleteTableImage = (storeId: number, tableId: number) : Promise<{ data: ApiResponse<DeleteTableImageResult> }> => {
  return api.delete(`/api/v1/stores/${storeId}/tables/${tableId}/table-image`);
};


export const patchTableInfo = (storeId: number, tableId: number, body: PatchTableRequest) =>
  api.patch<ApiResponse<{ updatedTables?: UpdatedTable[] }>>(
    `/api/v1/stores/${storeId}/tables/${tableId}`,
    body
);
