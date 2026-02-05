'use client'

import { AuthLayout } from "@/components/auth-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/components/admin-panel/google-login-button";

export default function HomePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    router.prefetch("/users");
  }, [router]);

  const handleGoogleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Hackerz Admin</h2>
          <p className="text-muted-foreground mt-2">
            Event check-ins, footfall tracking & attendance. Sign in to manage your POS.
          </p>
        </div>
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <GoogleLoginButton
          callbackUrl={"/users"}
          onError={handleGoogleError}
        />
      </div>
    </AuthLayout>
  );
}
