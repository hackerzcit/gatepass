"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { useEffect } from "react";

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let cancelled = false;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        if (cancelled) return;
        if (reg.installing) {
          reg.installing.addEventListener("statechange", function onState() {
            if (reg.installing?.state === "activated") {
              reg.installing.removeEventListener("statechange", onState);
            }
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="sticky top-0 z-50 w-full bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium shadow"
        >
          You are offline. Data is from local cache; changes will sync when back online.
        </div>
      )}
      {children}
    </>
  );
}
