"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet } from "lucide-react";
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
                    description: `Data updated from server`,
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
                <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <Wallet className="h-6 w-6" />
                    Payments Management
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    View and search all user payments across events
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
                    {syncing ? "Syncing..." : "Sync Payments"}
                </Button>
            </div>
        </div>
    );
}
