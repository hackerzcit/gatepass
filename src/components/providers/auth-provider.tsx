"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchWhenOffline={false}
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  );
} 