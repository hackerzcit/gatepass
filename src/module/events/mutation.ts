"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { db } from "@/db";
import type {
  Attendance,
  AttendanceData,
  MarkAttendanceVariables,
} from "./types";
import { queryKeys } from "./queries";

// ============================================================
// Mark Attendance
// ============================================================
export function useMarkAttendance(eventId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation<
    Attendance & { userName: string },
    Error,
    MarkAttendanceVariables,
    { previousAttendance?: AttendanceData }
  >({
    mutationFn: async ({ uniqueCode, userName }) => {
      let adminId =
        (session?.user as any)?.adminId ||
        (session?.user as any)?.userId ||
        "";

      if (!adminId) {
        const admins = await db.admins.toArray();
        adminId = admins[0]?.admin_id;
      }

      if (!adminId) {
        throw new Error("Admin ID not found");
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

    // Optimistic update
    onMutate: async ({ uniqueCode }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.events.attendance(eventId),
      });

      const previousAttendance =
        queryClient.getQueryData<AttendanceData>(
          queryKeys.events.attendance(eventId)
        );

      queryClient.setQueryData<AttendanceData>(
        queryKeys.events.attendance(eventId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            markedUniqueCodes: new Set([
              ...old.markedUniqueCodes,
              uniqueCode,
            ]),
          };
        }
      );

      return { previousAttendance };
    },

    onError: (_, __, context) => {
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
// Sync Pull (Server → IndexedDB)
// ============================================================
export function useSyncPull() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const tokenResponse = await fetch("/api/auth/get-token", {
        method: "POST",
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to fetch access token");
      }

      const { access_token } = await tokenResponse.json();

      const syncResponse = await fetch("/api/sync/pull", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token }),
      });

      if (!syncResponse.ok) {
        throw new Error("Sync failed");
      }

      return syncResponse.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.all,
      });
    },
  });
}
