'use client'

import { AuthLayout } from "@/components/auth-layout";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@/module/authentication/queries";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    try {
      await forgotPasswordMutation.mutateAsync({ email });
      setSuccess(true);
    } catch (error: any) {
      // Display the error message
      setError(error.message || "Password reset request failed");
    }
  };

  return (
    <AuthLayout>
         <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Reset Password</h2>
        <p className="text-muted-foreground mt-2">Enter your email to receive a password reset link</p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success ? (
        <div className="space-y-6">
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Password reset link sent! Kindly check your email.
          </div>
          <div className="text-center">
            <Link href="/" className="text-primary hover:underline">
              Return to login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full py-6"
            disabled={forgotPasswordMutation.isPending}
            size="lg"
          >
            {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
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