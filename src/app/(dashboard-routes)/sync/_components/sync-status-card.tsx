"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Database } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "@/db";

interface SyncStatus {
  lastSyncTime: string | null;
  lastPushTime: string | null;
  totalUsers: number;
  totalEvents: number;
  totalEnrollments: number;
  totalPayments: number;
  totalEntryLogs: number;
  totalAttendance: number;
  pendingEntryLogs: number;
  pendingAttendance: number;
}

export function SyncStatusCard() {
  const [status, setStatus] = useState<SyncStatus>({
    lastSyncTime: null,
    lastPushTime: null,
    totalUsers: 0,
    totalEvents: 0,
    totalEnrollments: 0,
    totalPayments: 0,
    totalEntryLogs: 0,
    totalAttendance: 0,
    pendingEntryLogs: 0,
    pendingAttendance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const [
          lastSync,
          lastPush,
          usersCount,
          eventsCount,
          enrollmentsCount,
          paymentsCount,
          entryLogsCount,
          attendanceCount,
          pendingEntryLogsCount,
          pendingAttendanceCount,
        ] = await Promise.all([
          db.sync_meta.get("lastPulledAt"),
          db.sync_meta.get("lastPushedAt"),
          db.users.count(),
          db.events.count(),
          db.enrollments.count(),
          db.payments.count(),
          db.entry_logs.count(),
          db.attendance.count(),
          db.entry_logs.where("_sync_status").equals("pending").count(),
          db.attendance.where("_sync_status").equals("pending").count(),
        ]);

        setStatus({
          lastSyncTime: lastSync?.value || null,
          lastPushTime: lastPush?.value || null,
          totalUsers: usersCount,
          totalEvents: eventsCount,
          totalEnrollments: enrollmentsCount,
          totalPayments: paymentsCount,
          totalEntryLogs: entryLogsCount,
          totalAttendance: attendanceCount,
          pendingEntryLogs: pendingEntryLogsCount,
          pendingAttendance: pendingAttendanceCount,
        });
      } catch (error) {
        console.error("Error fetching sync status:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  const getTimeSinceLastSync = () => {
    if (!status.lastSyncTime) return "Never synced";
    
    const lastSync = new Date(status.lastSyncTime);
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  const getSyncStatusBadge = () => {
    const hasPendingData = status.pendingEntryLogs > 0 || status.pendingAttendance > 0;
    
    if (hasPendingData) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pending Push
        </Badge>
      );
    }

    if (!status.lastSyncTime) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400">
          <AlertCircle className="h-3 w-3 mr-1" />
          Not Synced
        </Badge>
      );
    }

    const lastSync = new Date(status.lastSyncTime);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - lastSync.getTime()) / 60000);

    if (diffMins < 5) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
          <CheckCircle className="h-3 w-3 mr-1" />
          Up to date
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
        <Clock className="h-3 w-3 mr-1" />
        Needs Sync
      </Badge>
    );
  };

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="text-xl text-orange-700 dark:text-orange-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sync Status
          </div>
          {getSyncStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            {/* Sync Times */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">Last Pull (from server)</span>
                </div>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                  {status.lastSyncTime 
                    ? getTimeSinceLastSync()
                    : "Never"
                  }
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">Last Push (to server)</span>
                </div>
                <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                  {status.lastPushTime 
                    ? (() => {
                        const lastPush = new Date(status.lastPushTime);
                        const now = new Date();
                        const diffMs = now.getTime() - lastPush.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        
                        if (diffMins < 1) return "Just now";
                        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
                        
                        const diffHours = Math.floor(diffMins / 60);
                        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
                        
                        const diffDays = Math.floor(diffHours / 24);
                        return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
                      })()
                    : "Never"
                  }
                </span>
              </div>
            </div>

            {/* Pending Data Warning */}
            {(status.pendingEntryLogs > 0 || status.pendingAttendance > 0) && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-300 dark:border-orange-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                    Pending Changes to Push
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                    <span className="text-xs text-muted-foreground">Entry Logs</span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {status.pendingEntryLogs}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                    <span className="text-xs text-muted-foreground">Attendance</span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {status.pendingAttendance}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Data Counts */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Users</div>
                <div className="text-2xl font-bold text-orange-600">{status.totalUsers.toLocaleString()}</div>
              </div>
              
              <div className="p-3 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Events</div>
                <div className="text-2xl font-bold text-orange-600">{status.totalEvents.toLocaleString()}</div>
              </div>
              
              <div className="p-3 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Enrollments</div>
                <div className="text-2xl font-bold text-orange-600">{status.totalEnrollments.toLocaleString()}</div>
              </div>
              
              <div className="p-3 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Payments</div>
                <div className="text-2xl font-bold text-orange-600">{status.totalPayments.toLocaleString()}</div>
              </div>
              
              <div className="p-3 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Entry Logs</div>
                <div className="text-2xl font-bold text-orange-600">{status.totalEntryLogs.toLocaleString()}</div>
              </div>
              
              <div className="p-3 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Attendance</div>
                <div className="text-2xl font-bold text-orange-600">{status.totalAttendance.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
