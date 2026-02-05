"use client";

import { db } from "@/db";
import type { Event, User, Enrollment } from "@/db";
import { useEffect, useState } from "react";

// ============================================================
// Events List Hook
// ============================================================
export function useEventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);
        const allEvents = await db.events.toArray();
        setEvents(allEvents);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch events");
        setError(error);
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return { events, loading, error };
}

// ============================================================
// Event Detail Hook (with enrolled users)
// ============================================================
export function useEventDetail(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [enrolledUsers, setEnrolledUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEventDetail() {
      try {
        setLoading(true);
        setError(null);

        // Get event details
        const eventData = await db.events.get(eventId);
        if (!eventData) {
          throw new Error("Event not found");
        }
        setEvent(eventData);

        // Get all enrollments for this event
        const eventEnrollments = await db.enrollments
          .where("event_id")
          .equals(eventId)
          .toArray();
        setEnrollments(eventEnrollments);

        // Get all enrolled user IDs
        const userIds = eventEnrollments.map((e) => e.user_id);

        // Fetch user details
        if (userIds.length > 0) {
          const users = await db.users
            .where("user_id")
            .anyOf(userIds)
            .toArray();
          setEnrolledUsers(users);
        } else {
          setEnrolledUsers([]);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch event details");
        setError(error);
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      fetchEventDetail();
    }
  }, [eventId]);

  return { event, enrolledUsers, enrollments, loading, error };
}

// ============================================================
// Event Users Search Hook
// ============================================================
export function useEventUsersSearch(eventId: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { enrolledUsers } = useEventDetail(eventId);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers(enrolledUsers);
      return;
    }

    try {
      setLoading(true);
      const lowerQuery = query.toLowerCase().trim();

      // Filter enrolled users based on search query
      const results = enrolledUsers.filter((user) => {
        return !!(
          user.user_id?.toLowerCase().includes(lowerQuery) ||
          user.unique_code?.toLowerCase().includes(lowerQuery) ||
          user.email?.toLowerCase().includes(lowerQuery) ||
          user.mobile_number?.toLowerCase().includes(lowerQuery) ||
          user.name?.toLowerCase().includes(lowerQuery)
        );
      });

      setUsers(results);
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        setUsers(enrolledUsers);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, enrolledUsers]);

  return { users, loading, searchQuery, setSearchQuery };
}

// ============================================================
// Attendance Check Hook
// ============================================================
export function useAttendanceCheck(eventId: string, userIds: string[]) {
  const [markedUsers, setMarkedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const checkAttendance = async () => {
    if (!eventId || userIds.length === 0) {
      setMarkedUsers(new Set());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get unique codes for all users
      const users = await db.users
        .where("user_id")
        .anyOf(userIds)
        .toArray();

      const uniqueCodes = users.map((u) => u.unique_code);

      // Check attendance records
      const attendanceRecords = await db.attendance
        .where("event_id")
        .equals(eventId)
        .and((record) => uniqueCodes.includes(record.unique_code))
        .toArray();

      const marked = new Set(attendanceRecords.map((a) => a.unique_code));
      setMarkedUsers(marked);
    } catch (error) {
      console.error("Error checking attendance:", error);
      setMarkedUsers(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAttendance();
  }, [eventId, userIds.join(",")]);

  return { markedUsers, setMarkedUsers, checkAttendance };
}