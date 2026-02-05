"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Upload, Loader2, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { syncPull, syncPush } from "@/db";
import { toast } from "sonner";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function SyncActionsCard() {
  const isOnline = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [pushing, setPushing] = useState(false);

  const handlePullSync = async () => {
    try {
      setSyncing(true);
      toast.info("Starting sync from server...");

      // Fetch access token
      const tokenResponse = await fetch("/api/auth/get-token");
      if (!tokenResponse.ok) {
        toast.error("Failed to fetch access token");
        return;
      }

      const { access_token } = await tokenResponse.json();

      // Perform sync
      const result = await syncPull(access_token);

      if (result.success) {
        toast.success("Sync completed successfully!", {
          description: `Users: ${result.counts?.users || 0}, Events: ${result.counts?.events || 0}, Enrollments: ${result.counts?.enrollments || 0}, Payments: ${result.counts?.payments || 0}`,
        });
        
        // Reload page to update stats
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("Sync failed", {
          description: result.error || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Error syncing:", error);
      toast.error("Sync failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handlePushSync = async () => {
    try {
      setPushing(true);
      toast.info("Starting push sync to server...");

      // Fetch access token
      const tokenResponse = await fetch("/api/auth/get-token");
      if (!tokenResponse.ok) {
        toast.error("Failed to fetch access token");
        return;
      }

      const { access_token } = await tokenResponse.json();

      // Perform push sync
      const result = await syncPush(access_token);

      if (result.success) {
        const { users, entries, attendance } = result.counts || {
          users: { total: 0, processed: 0 },
          entries: { total: 0, processed: 0 },
          attendance: { total: 0, processed: 0 },
        };

        if (users.total === 0 && entries.total === 0 && attendance.total === 0) {
          toast.info("No pending changes to sync");
        } else {
          toast.success("Push sync completed successfully!", {
            description: `Users: ${users.processed}/${users.total}, Entry Logs: ${entries.processed}/${entries.total}, Attendance: ${attendance.processed}/${attendance.total}`,
          });

          // Show errors if any
          if (result.errors && result.errors.length > 0) {
            toast.warning("Some records failed to sync", {
              description: `${result.errors.length} error(s) occurred`,
            });
          }
        }
        
        // Reload page to update stats
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("Push sync failed", {
          description: result.error || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Error pushing sync:", error);
      toast.error("Push sync failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setPushing(false);
    }
  };

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="text-xl text-orange-700 dark:text-orange-400 flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Sync Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pull from Server */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-400">
              Pull from Server
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Download the latest data from the server to your local database
            </p>
            <Button
              onClick={handlePullSync}
              disabled={syncing || !isOnline}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isOnline ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Offline
                </>
              ) : syncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Pull Latest Data
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="border-t border-orange-200 dark:border-orange-800 my-4"></div>

          {/* Push to Server */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-400">
              Push to Server
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Upload pending local changes (entry logs, attendance) to the server
            </p>
            <Button
              onClick={handlePushSync}
              disabled={pushing || !isOnline}
              variant="outline"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-950/30"
            >
              {!isOnline ? (
                <>
                  <Upload className="h-4 w-4" />
                  Offline
                </>
              ) : pushing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Pushing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Push Changes
                </>
              )}
            </Button>
          </div>

          {/* Connection Status */}
          <div className={`mt-4 p-3 rounded-lg border ${
            isOnline 
              ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                    Connected
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                    Offline - Sync disabled
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              💡 <strong>Tip:</strong> Sync regularly to ensure your data is up-to-date. 
              Pull sync downloads data from the server, while push sync uploads your local changes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
