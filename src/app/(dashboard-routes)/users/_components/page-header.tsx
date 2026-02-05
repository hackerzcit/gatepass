"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { syncPull } from "@/db";
import { toast } from "sonner";

export function PageHeader() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setSyncing(true);

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
        toast.success("Sync completed successfully", {
          description: `Users: ${result.counts?.users || 0}, Events: ${result.counts?.events || 0}`,
        });
        // Reload page to update stats
        window.location.reload();
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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400">
          User Management
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and search users in the system
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSync}
          disabled={syncing}
          variant="outline"
          className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30 hover:text-orange-700"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Users"}
        </Button>

        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>
    </div>
  );
}