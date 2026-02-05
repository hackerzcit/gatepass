"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { SyncStatusCard, SyncActionsCard } from "./_components";

export default function SyncPage() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;

  return (
    <ContentLayout title="Sync Status">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400">
            Sync Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage data synchronization between local database and server
          </p>
        </div>

        {/* Sync Status and Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SyncStatusCard />
          <SyncActionsCard />
        </div>

        {/* Additional Info Card */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400 mb-3">
            About Data Synchronization
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Pull Sync:</strong> Downloads the latest data from the server, including users, events, enrollments, and payments. 
              This ensures your local database has the most recent information.
            </p>
            <p>
              <strong>Push Sync:</strong> Uploads your local changes (entry logs, attendance records, and new on-spot users) 
              to the server. This ensures your attendance tracking is synchronized.
            </p>
            <p className="text-orange-700 dark:text-orange-400">
              <strong>Note:</strong> Always sync before starting attendance sessions to ensure you have the latest user data.
            </p>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
