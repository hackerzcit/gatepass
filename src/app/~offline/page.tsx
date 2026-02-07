"use client";

import { WifiOff, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useServiceWorkerStatus } from "@/hooks/use-service-worker-status";

/**
 * Shown when the app is opened offline and the cached app shell isn’t available
 * (e.g. first open ever offline, or cache cleared). Use production build
 * (pnpm build && pnpm start) so the app shell is cached and reopens from cache when offline.
 */
export default function OfflineFallbackPage() {
  const [showDebug, setShowDebug] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const swStatus = useServiceWorkerStatus();

  useEffect(() => {
    setShowDebug(
      process.env.NODE_ENV === "development" ||
        new URLSearchParams(window.location.search).get("sw-debug") === "1"
    );
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="rounded-full bg-muted p-4">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">You&apos;re offline</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Open the app when you have connection first so it can be cached. Then you can close and reopen it offline to use your local data.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open app
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Retry
          </button>
        </div>

        {showDebug && (
          <div className="mt-8 w-full max-w-sm rounded-lg border border-border bg-muted/50 p-3 text-left">
            <button
              type="button"
              onClick={() => setDebugOpen((o) => !o)}
              className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground"
            >
              Service worker debug
              {debugOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {debugOpen && swStatus.ready && (
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>Controlled by SW: {swStatus.isControlled ? "Yes" : "No"}</li>
                <li>Start URL (/) in cache: {swStatus.hasStartUrlInCache ? "Yes" : "No"}</li>
                <li>Offline page in cache: {swStatus.hasOfflinePageInCache ? "Yes" : "No"}</li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
