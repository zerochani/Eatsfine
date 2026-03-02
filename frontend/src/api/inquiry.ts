import type {
  ResponseInquiryDTO,
  SupportFormValues,
} from "@/components/customer-support/support.schema";
import type { ApiResponse } from "@/types/api";
import { api } from "./axios";

export const postInquiry = async (
  body: SupportFormValues,
): Promise<ResponseInquiryDTO> => {
  const { data } = await api.post<ApiResponse<ResponseInquiryDTO>>(
    "/api/v1/inquiries",
    body,
  );
  return data.result;
};
