import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import { useEffect, useState } from "react";
import { db } from "@/db";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    // Fetch last sync time from sync_meta
    async function fetchLastSync() {
      try {
        const syncMeta = await db.sync_meta.get("lastPulledAt");
        if (syncMeta?.value) {
          setLastSync(syncMeta.value);
        }
      } catch (error) {
        console.error("Error fetching last sync:", error);
      }
    }

    fetchLastSync();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchLastSync, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return "Never synced";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <h1 className="font-bold">{title}</h1>
        </div>
        
        <div className="flex flex-1 items-center justify-end gap-3">
          {/* Online/Offline Status */}
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1.5 font-medium text-xs",
              isOnline
                ? "border-green-300 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                : "border-red-300 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
            )}
          >
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Offline
              </>
            )}
          </Badge>

          {/* Last Sync */}
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 border-orange-300 text-orange-700 dark:text-orange-400 font-medium text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Last sync:</span>
            <span>{formatLastSync(lastSync)}</span>
          </Badge>

          {/* <ModeToggle /> */}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
