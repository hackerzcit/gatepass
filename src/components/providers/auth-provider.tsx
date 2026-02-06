"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { db, initDB } from "@/db";
import type { Admin } from "@/db";

/** Login response data from backend POST /admin/login */
export interface AuthAdmin {
  admin_id: string;
  name: string;
  email: string;
  created_at: string;
  code_block: Admin["code_block"];
}

type AuthContextValue = {
  admin: AuthAdmin | null;
  isReady: boolean;
  setAdmin: (data: AuthAdmin) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdminState] = useState<AuthAdmin | null>(null);
  const [isReady, setIsReady] = useState(false);

  const setAdmin = useCallback((data: AuthAdmin) => {
    setAdminState(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await initDB();
        const admins = await db.admins.toArray();
        const first = admins[0];
        if (!cancelled && first) {
          setAdminState({
            admin_id: first.admin_id,
            name: first.name,
            email: first.email,
            created_at: first.created_at,
            code_block: first.code_block,
          });
        }
      } catch {
        if (!cancelled) setAdminState(null);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = useCallback(async () => {
    setAdminState(null);
    try {
      await initDB();
      await db.admins.clear();
    } catch {
      // ignore
    }
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider
      value={{ admin, isReady, setAdmin, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
