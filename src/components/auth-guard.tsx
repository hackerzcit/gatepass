"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { admin, isReady } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!admin && pathname !== "/") {
      router.replace("/");
    }
  }, [isReady, admin, pathname, router]);

  if (!isReady) return null;
  if (!admin && pathname !== "/") return null;
  return <>{children}</>;
}
