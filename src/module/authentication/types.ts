export interface BaseResponse<T = null> {
  success: boolean;
  message: string | { error: string };
  data: T;
}

//forgot-password
export interface ForgotPasswordPayload {
  email: string;
}

//reset-password
export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

//change-password
export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  user_id: string;
  updated_at: string;
}

//refresh-token
export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}
