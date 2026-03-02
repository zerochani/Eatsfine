
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}


export interface ApiError {
  status: number;
  code?: string;
  message: string;
}
