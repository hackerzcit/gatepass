import { useMutation } from "@tanstack/react-query";
import {
  forgotPasswordApi,
  resetPasswordApi,
  refreshTokenApi,
  changePasswordApi
} from "./api";
import type {
  ForgotPasswordPayload,
  ResetPasswordPayload,
  RefreshTokenPayload,
  ChangePasswordPayload,
} from "./types";
import { toast } from "sonner";
import { parseApiError } from "@/lib/parse-api-errors";

/**
 * Forgot Password Mutation
 */
export const useForgotPassword = () =>
  useMutation({
    mutationFn: (data: ForgotPasswordPayload) => forgotPasswordApi(data),
    onSuccess: () => {
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    }
  });

/**
 * Reset Password Mutation
 */
export const useResetPassword = () =>
  useMutation({
    mutationFn: (data: ResetPasswordPayload) => resetPasswordApi(data),
    onSuccess: () => {
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    }
  });

/**
 * Change Password Mutation
 */
export const useChangePassword = () =>
  useMutation({
    mutationFn: (data: ChangePasswordPayload) => changePasswordApi(data),
    onSuccess: (res) => {
      toast.success(res.message as string);
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    }
  });

/**
 * Refresh Token Mutation
 */
export const useRefreshToken = () =>
  useMutation({
    mutationFn: (data: RefreshTokenPayload) => refreshTokenApi(data),
    onSuccess: () => {
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    }
  });
