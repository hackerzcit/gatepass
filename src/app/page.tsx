"use client";

import { AuthLayout } from "@/components/auth-layout";
import { useAuth } from "@/components/providers/auth-provider";
import { db, initDB } from "@/db";
import type { Admin } from "@/db";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  "https://hackerz-app-backend-new-production.up.railway.app";

export default function HomePage() {
  const router = useRouter();
  const { admin, isReady, setAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && admin) {
      router.replace("/users");
    }
  }, [isReady, admin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your admin email.");
      return;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("You are offline. Connect to the internet to sign in.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_email: email.trim() }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.success || !json?.data) {
        setError(json?.message || "Login failed. Check your email or try again.");
        setLoading(false);
        return;
      }

      const data = json.data as {
        admin_id: string;
        name: string;
        email: string;
        created_at: string;
        code_block?: Admin["code_block"];
      };

      const defaultCodeBlock: Admin["code_block"] = {
        id: "",
        admin_id: data.admin_id,
        range_start: 0,
        range_end: 0,
        current_value: 0,
        updated_at: new Date().toISOString(),
      };
      const adminForDb: Admin = {
        admin_id: data.admin_id,
        name: data.name,
        email: data.email,
        created_at: data.created_at,
        code_block: data.code_block ?? defaultCodeBlock,
      };

      await initDB();
      await db.admins.put(adminForDb);

      setAdmin({
        admin_id: data.admin_id,
        name: data.name,
        email: data.email,
        created_at: data.created_at,
        code_block: data.code_block ?? defaultCodeBlock,
      });

      router.push("/users");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (isReady && admin) {
    return null;
  }

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
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin_email">Admin email</Label>
            <Input
              id="admin_email"
              name="admin_email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
