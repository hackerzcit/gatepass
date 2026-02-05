"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useAnalyticsDashboard } from "../../_hooks/analytics-queries";
import {
  EntriesAttendanceSection,
  EventsSection,
  OverviewCards,
  PaymentsSection,
  UsersSection,
} from "./_components";

export default function AnalyticsDashboardPage() {
  const sidebar = useStore(useSidebar, (x) => x);
  const { data, loading, error, refetch } = useAnalyticsDashboard();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (!sidebar) return null;

  return (
    <ContentLayout title="Live Dashboard">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Live analytics from backend. Data updates when you refresh.
          </p>
          <Button
            onClick={() => refetch()}
            disabled={loading}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error.message}
          </div>
        )}

        <OverviewCards overview={data?.overview ?? null} loading={loading} />

        {data && (
          <>
            <section>
              <h2 className="text-lg font-semibold mb-3 text-orange-700 dark:text-orange-400">
                Users
              </h2>
              <UsersSection users={data.users} />
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-orange-700 dark:text-orange-400">
                Events
              </h2>
              <EventsSection events={data.events} />
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-orange-700 dark:text-orange-400">
                Payments
              </h2>
              <PaymentsSection payments={data.payments} />
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3 text-orange-700 dark:text-orange-400">
                Recent entries & attendance
              </h2>
              <EntriesAttendanceSection
                entries={data.entries}
                attendance={data.attendance}
              />
            </section>

            {data.timestamp && (
              <p className="text-xs text-muted-foreground text-right">
                Last updated:{" "}
                {new Date(data.timestamp).toLocaleString()}
              </p>
            )}
          </>
        )}

        {!loading && !error && !data && (
          <p className="text-muted-foreground text-center py-8">
            No data available. Click Refresh to load.
          </p>
        )}
      </div>
    </ContentLayout>
  );
}
