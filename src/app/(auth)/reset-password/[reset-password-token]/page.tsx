'use client'

import { AuthLayout } from "@/components/auth-layout";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useResetPassword } from "@/module/authentication/queries";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const params = useParams();
  const router = useRouter();
  const token = params["reset-password-token"] as string;

  const resetPasswordMutation = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate password match
    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        new_password: newPassword
      });
      setSuccess(true);
    } catch (error: any) {
      // Display the error message
      setValidationError(error.message || "Password reset failed");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Reset Your Password</h2>
          <p className="text-muted-foreground mt-2">Enter a new password for your account</p>
        </div>

        {validationError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {validationError}
          </div>
        )}



        {success ? (
          <div className="space-y-6">
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Password reset successful! You can now login with your new password.
            </div>
            <div className="text-center">
              <Link href="/" className="text-primary hover:underline">
                Go to login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              className="w-full py-6"
              disabled={resetPasswordMutation.isPending}
              size="lg"
            >
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>

            <div className="text-center">
              <Link href="/" className="text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}