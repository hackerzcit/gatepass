"use client";

import { useQuery } from "@tanstack/react-query";
import { db } from "@/db";
import { useState, useEffect } from "react";
import type {
  Event,
  User,
  Enrollment,
  Attendance,
  AttendanceData,
  EventsQueryKey,
  EventDetailQueryKey,
  EventEnrollmentsQueryKey,
  EventUsersQueryKey,
  EventAttendanceQueryKey,
  UserSearchQueryKey,
} from "./types";

// ============================================================
// Query Keys
// ============================================================
export const queryKeys = {
  events: {
    all: ["events"] as const,
    detail: (eventId: string) => ["events", eventId] as const,
    enrollments: (eventId: string) =>
      ["events", eventId, "enrollments"] as const,
    users: (eventId: string) => ["events", eventId, "users"] as const,
    attendance: (eventId: string) =>
      ["events", eventId, "attendance"] as const,
  },
  users: {
    search: (query: string) => ["users", "search", query] as const,
  },
} as const;

// ============================================================
// Events List
// ============================================================
export function useEventsList() {
  return useQuery<Event[], Error, Event[], EventsQueryKey>({
    queryKey: queryKeys.events.all,
    queryFn: async () => db.events.toArray(),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

// ============================================================
// Event Detail (Combined Hook)
// ============================================================
export function useEventDetail(eventId: string) {
  const eventQuery = useQuery<Event | undefined>({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: async () => db.events.get(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });

  const enrollmentsQuery = useQuery<Enrollment[]>({
    queryKey: queryKeys.events.enrollments(eventId),
    queryFn: async () =>
      db.enrollments.where("event_id").equals(eventId).toArray(),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });

  const usersQuery = useQuery<User[]>({
    queryKey: queryKeys.events.users(eventId),
    queryFn: async () => {
      const enrollments = enrollmentsQuery.data || [];
      const ids = enrollments.map((e) => e.user_id);
      if (ids.length === 0) return [];
      return db.users.where("user_id").anyOf(ids).toArray();
    },
    enabled: !!eventId && (enrollmentsQuery.data?.length || 0) > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    event: eventQuery.data,
    enrolledUsers: usersQuery.data || [],
    loading: eventQuery.isLoading || enrollmentsQuery.isLoading || usersQuery.isLoading,
    error: eventQuery.error || enrollmentsQuery.error || usersQuery.error,
  };
}

// ============================================================
// Event Users Search
// ============================================================
export function useEventUsersSearch(eventId: string) {
  const [searchQuery, setSearchQuery] = useState("");
  const { enrolledUsers } = useEventDetail(eventId);

  const searchQuery_normalized = useQuery<User[]>({
    queryKey: [...queryKeys.users.search(searchQuery), eventId],
    queryFn: async () => {
      if (!searchQuery.trim()) return enrolledUsers;

      const q = searchQuery.toLowerCase();
      const enrolledUserIds = new Set(enrolledUsers.map(u => u.user_id));
      
      return enrolledUsers.filter((u) =>
        u.user_id?.toLowerCase().includes(q) ||
        u.unique_code?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.mobile_number?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q)
      );
    },
    enabled: !!eventId && enrolledUsers.length > 0,
    staleTime: 30 * 1000,
  });

  return {
    users: searchQuery_normalized.data || enrolledUsers,
    loading: searchQuery_normalized.isLoading,
    searchQuery,
    setSearchQuery,
  };
}

// ============================================================
// Event Attendance Check
// ============================================================
export function useAttendanceCheck(eventId: string, userIds: string[]) {
  const [markedUsers, setMarkedUsers] = useState<Set<string>>(new Set());

  const attendanceQuery = useQuery<AttendanceData>({
    queryKey: queryKeys.events.attendance(eventId),
    queryFn: async () => {
      const records = await db.attendance
        .where("event_id")
        .equals(eventId)
        .toArray();

      return {
        records,
        markedUniqueCodes: new Set(records.map((r) => r.unique_code)),
      };
    },
    enabled: !!eventId,
    staleTime: 30 * 1000,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  // Update local state when query data changes
  useEffect(() => {
    if (attendanceQuery.data) {
      setMarkedUsers(attendanceQuery.data.markedUniqueCodes);
    }
  }, [attendanceQuery.data]);

  return {
    markedUsers,
    setMarkedUsers,
    attendance: attendanceQuery.data,
    loading: attendanceQuery.isLoading,
  };
}

// ============================================================
// Event Enrollments
// ============================================================
export function useEventEnrollments(eventId: string) {
  return useQuery<Enrollment[]>({
    queryKey: queryKeys.events.enrollments(eventId),
    queryFn: async () =>
      db.enrollments.where("event_id").equals(eventId).toArray(),
    enabled: !!eventId,
  });
}

// ============================================================
// Event Users
// ============================================================
export function useEventUsers(eventId: string) {
  const { data: enrollments = [] } = useEventEnrollments(eventId);

  return useQuery<User[]>({
    queryKey: queryKeys.events.users(eventId),
    queryFn: async () => {
      const ids = enrollments.map((e) => e.user_id);
      if (ids.length === 0) return [];
      return db.users.where("user_id").anyOf(ids).toArray();
    },
    enabled: !!eventId && enrollments.length > 0,
  });
}

// ============================================================
// Event Attendance
// ============================================================
export function useEventAttendance(eventId: string) {
  return useQuery<AttendanceData>({
    queryKey: queryKeys.events.attendance(eventId),
    queryFn: async () => {
      const records = await db.attendance
        .where("event_id")
        .equals(eventId)
        .toArray();

      return {
        records,
        markedUniqueCodes: new Set(records.map((r) => r.unique_code)),
      };
    },
    enabled: !!eventId,
    staleTime: 60 * 1000,
  });
}

// ============================================================
// User Search
// ============================================================
export function useUserSearch(searchQuery: string) {
  return useQuery<User[]>({
    queryKey: queryKeys.users.search(searchQuery),
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const q = searchQuery.toLowerCase();
      return db.users
        .filter(
          (u) =>
            u.user_id?.toLowerCase().includes(q) ||
            u.unique_code?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.mobile_number?.toLowerCase().includes(q) ||
            u.name?.toLowerCase().includes(q)
        )
        .limit(50)
        .toArray();
    },
    enabled: searchQuery.trim().length > 0,
  });
}