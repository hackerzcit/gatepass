"use client";

import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "../ui/button";

interface SignInButtonProps {
  callbackUrl?: string;
  onError?: (error: string) => void;
}

const GoogleLoginButton = ({ callbackUrl = "/users", onError }: SignInButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const error = window.location.search.split("error=")[1];
    if (error) {
      let errorMessage = "An error occurred during Google login.";

      switch (error) {
        case "AccessDenied":
          errorMessage = "Account not found. Please contact your administrator for assistance.";
          break;
        case "OAuthSignin":
          errorMessage = "Error starting Google login. Please try again.";
          break;
        case "OAuthCallback":
          errorMessage = "Error completing Google login. Please try again.";
          break;
        case "EmailNotVerified":
          errorMessage = "Email not verified. Please verify your email first.";
          break;
        case "OAuthAccountNotLinked":
          errorMessage = "This email is already registered with a different login method.";
          break;
        default:
          errorMessage = `Login error: ${error}`;
      }

      if (onError) {
        onError(errorMessage);
      }
      // Clear the error from the URL without triggering a refresh
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [onError]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signIn("google", {
        callbackUrl,
        redirect: false
      });

      if (result?.error) {
        if (onError) {
          onError(result.error);
        }
      }
    } catch (error) {
      if (onError) {
        onError("Failed to connect to Google. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center">
        <Button
          className="flex-1 flex items-center justify-center bg-background border border-input text-foreground font-medium py-2 rounded-lg hover:bg-muted transition-colors"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {isLoading ? "Connecting..." : "Login with Google"}
        </Button>
      </div>
    </div>
  );
};

export default GoogleLoginButton;