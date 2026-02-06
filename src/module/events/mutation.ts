"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { db, syncPull } from "@/db"; // Import syncPull from your db file
import type {
  Attendance,
  AttendanceData,
  MarkAttendanceVariables,
  SyncPullResponse,
} from "./types";
import { queryKeys } from "./queries";

// ============================================================
// Mark Attendance
// ============================================================
export function useMarkAttendance(eventId: string) {
  const queryClient = useQueryClient();
  const { admin } = useAuth();

  return useMutation<
  Attendance & { userName: string },
  Error,
  MarkAttendanceVariables,
  { previousAttendance?: AttendanceData }
>({

    mutationFn: async ({ uniqueCode, userName }) => {
      const adminId = admin?.admin_id;
      if (!adminId) {
        throw new Error("Admin ID not found. Please log in again.");
      }

      const record: Attendance = {
        unique_code: uniqueCode,
        event_id: eventId,
        admin_id: adminId,
        created_at: new Date().toISOString(),
        _sync_status: "pending",
      };

      const id = await db.attendance.add(record);
      return { ...record, id, userName };
    },

    onMutate: async ({ uniqueCode }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.events.attendance(eventId),
      });

      const previousAttendance = queryClient.getQueryData<AttendanceData>(
        queryKeys.events.attendance(eventId)
      );

      queryClient.setQueryData<AttendanceData>(
        queryKeys.events.attendance(eventId),
        (old) =>
          old
            ? {
                ...old,
                markedUniqueCodes: new Set([
                  ...Array.from(old.markedUniqueCodes),
                  uniqueCode,
                ]),
              }
            : old
      );

      return { previousAttendance };
    },

    onError: (error, _, context) => {
      console.error("Failed to mark attendance:", error);

      if (context?.previousAttendance) {
        queryClient.setQueryData(
          queryKeys.events.attendance(eventId),
          context.previousAttendance
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.attendance(eventId),
      });
    },
  });
}

// ============================================================
// Sync Pull (Server → IndexedDB) - Using existing syncPull function
// ============================================================
export function useSyncPull() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await syncPull(undefined);

      if (!result.success) {
        throw new Error(result.error || "Sync failed");
      }

      return result;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      console.log("Sync completed:", data.counts);
    },

    onError: (error) => {
      console.error("Sync failed:", error);
    },
  });
}

// ============================================================
// Sync Push Attendance (IndexedDB → Server)
// ============================================================
export function useSyncPushAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const pending = await db.attendance
        .where("_sync_status")
        .equals("pending")
        .toArray();

      if (pending.length === 0) {
        return { success: true, synced_count: 0 };
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_BACKEND_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "https://hackerz-app-backend-new-production.up.railway.app";

      const headers: Record<string, string> = { "Content-Type": "application/json" };

      const res = await fetch(`${API_BASE_URL}/sync/push-attendance`, {
        method: "POST",
        headers,
        body: JSON.stringify({ attendance: pending }),
      });

      if (!res.ok) throw new Error("Failed to push attendance");

      const result = await res.json();

      if (result.success) {
        await Promise.all(
          pending.map((r) =>
            db.attendance.update(r.id!, { _sync_status: "synced" })
          )
        );
      }

      return result;
    },

    onSuccess: (data) => {
      console.log(`Synced ${data.synced_count} attendance records`);
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },

    onError: (error) => {
      console.error("Failed to push attendance:", error);
    },
  });
}

// ============================================================
// Sync Push Entry Logs (IndexedDB → Server)
// ============================================================
export function useSyncPushEntryLogs() {
  return useMutation({
    mutationFn: async () => {
      const pending = await db.entry_logs
        .where("_sync_status")
        .equals("pending")
        .toArray();

      if (pending.length === 0) {
        return { success: true, synced_count: 0 };
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_BACKEND_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "https://hackerz-app-backend-new-production.up.railway.app";

      const headers: Record<string, string> = { "Content-Type": "application/json" };

      const res = await fetch(`${API_BASE_URL}/sync/push-entry-logs`, {
        method: "POST",
        headers,
        body: JSON.stringify({ entry_logs: pending }),
      });

      if (!res.ok) throw new Error("Failed to push entry logs");

      const result = await res.json();

      if (result.success) {
        await Promise.all(
          pending.map((l) =>
            db.entry_logs.update(l.id!, { _sync_status: "synced" })
          )
        );
      }

      return result;
    },
  });
}