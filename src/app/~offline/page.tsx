"use client";

import { WifiOff } from "lucide-react";
import Link from "next/link";

/**
 * Shown when the app is opened offline and the cached app shell isn’t available
 * (e.g. first open ever offline, or cache cleared). Use production build
 * (pnpm build && pnpm start) so the app shell is cached and reopens from cache when offline.
 */
export default function OfflineFallbackPage() {
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
      </div>
    </div>
  );
}
