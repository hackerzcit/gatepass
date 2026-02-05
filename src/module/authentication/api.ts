import axios from "axios";
import type {
  BaseResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  RefreshTokenPayload,
  RefreshTokenResponse,
  ChangePasswordPayload, ChangePasswordResponse
} from "./types";
import { axiosBase, axiosInstance } from "@/lib/axios-instance";

//forgot-password
export const forgotPasswordApi = async (data: ForgotPasswordPayload): Promise<BaseResponse> => {
  const response = await axiosBase.post<BaseResponse>("/auth/forgot-password", data);
  return response.data;
};

//reset-password
export const resetPasswordApi = async (data: ResetPasswordPayload): Promise<BaseResponse> => {
  const response = await axiosBase.post<BaseResponse>("/auth/reset-password", data);
  return response.data;
};

//change-password
export const changePasswordApi = async (
  data: ChangePasswordPayload
): Promise<BaseResponse<ChangePasswordResponse>> => {
  const response = await axiosInstance.post<BaseResponse<ChangePasswordResponse>>(
    "/users/change-password",
    data
  );
  return response.data;
};

//refresh-token
export const refreshTokenApi = async (data: RefreshTokenPayload): Promise<BaseResponse<RefreshTokenResponse>> => {
  const response = await axiosBase.post<BaseResponse<RefreshTokenResponse>>("/auth/refresh-token", data);
  return response.data;
};
