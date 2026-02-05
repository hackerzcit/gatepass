export interface BaseResponse<T = null> {
  success: boolean;
  message: string | { error: string };
  data: T;
}
