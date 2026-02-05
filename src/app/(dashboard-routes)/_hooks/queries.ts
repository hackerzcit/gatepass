"use client";

import { db, User } from "@/db";
import { useEffect, useState } from "react";

// ============================================================
// Types
// ============================================================

export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalEnrollments: number;
  totalPayments: number;
}

// ============================================================
// Dashboard Stats Hook
// ============================================================

const initialStats: DashboardStats = {
  totalUsers: 0,
  totalEvents: 0,
  totalEnrollments: 0,
  totalPayments: 0,
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const [usersCount, eventsCount, enrollmentsCount, paymentsCount] =
          await Promise.all([
            db.users.count(),
            db.events.count(),
            db.enrollments.count(),
            db.payments.count(),
          ]);

        setStats({
          totalUsers: usersCount,
          totalEvents: eventsCount,
          totalEnrollments: enrollmentsCount,
          totalPayments: paymentsCount,
        });
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to fetch stats");
        setError(error);
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}

// ============================================================
// Users Search Hook
// ============================================================

export function useUsersSearch() {
  const [users, setUsers] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const lowerQuery = query.toLowerCase().trim();

      // Search across multiple fields
      const results = await db.users
        .filter((user: User): boolean => {
          return !!(
            user.user_id?.toLowerCase().includes(lowerQuery) ||
            user.unique_code?.toLowerCase().includes(lowerQuery) ||
            user.email?.toLowerCase().includes(lowerQuery) ||
            user.mobile_number?.toLowerCase().includes(lowerQuery) ||
            user.name?.toLowerCase().includes(lowerQuery)
          );
        })
        .limit(50)
        .toArray();

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
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return { users, loading, searchQuery, setSearchQuery };
}

// ============================================================
// Payments Search Hook
// ============================================================

export function usePaymentsSearch() {
  const [payments, setPayments] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  const searchPayments = async (
    query: string,
    eventId: string,
    currentPage: number,
    limit: number,
  ) => {
    try {
      setLoading(true);
      const lowerQuery = query.toLowerCase().trim();

      // Get all payments (offline data)
      const allPayments = await db.payments.toArray();

      // Robust filtering by eventId
      const filteredByEvent = allPayments.filter((p) => {
        if (eventId === "all") return true;
        const pEventId = p.event_id || p.eventId;
        return pEventId === eventId;
      });

      // Enrich only the filtered data for searching (or search first then enrich if performance issues)
      // For thousands of records, we might want to search raw data first
      const searchedPayments = filteredByEvent.filter((p: any) => {
        if (!lowerQuery) return true;

        // Search in payment fields directly first (faster)
        const paymentId = (p.payment_id || p.paymentId || "").toLowerCase();
        if (paymentId.includes(lowerQuery)) return true;

        // For user/event fields, we might need to check if they are already enriched or fetch them
        // To be safe and thorough, we'll enrich then filter
        return true;
      });

      // Actually, let's enrich then filter for full search capability as we did before
      const enrichedPayments = await Promise.all(
        searchedPayments.map(async (payment) => {
          const userId = payment.user_id || payment.userId;
          const evId = payment.event_id || payment.eventId;

          const [user, event] = await Promise.all([
            userId ? db.users.get(userId) : Promise.resolve(undefined),
            evId ? db.events.get(evId) : Promise.resolve(undefined),
          ]);

          return { ...payment, user, event };
        }),
      );

      // Final filter with enriched data
      const finalResults = enrichedPayments.filter((p: any) => {
        if (!lowerQuery) return true;

        const userName = p.user?.name || p.user?.userName || "";
        const userEmail = p.user?.email || "";
        const userCode = p.user?.unique_code || "";
        const eventName =
          p.event?.name || p.event?.event_name || p.event?.title || "";
        const paymentId = p.payment_id || p.paymentId || "";

        const searchStr =
          `${userName} ${userEmail} ${userCode} ${eventName} ${paymentId}`.toLowerCase();
        return searchStr.includes(lowerQuery);
      });

      setTotalCount(finalResults.length);

      // Apply pagination
      const startIndex = (currentPage - 1) * limit;
      const paginatedResults = finalResults.slice(
        startIndex,
        startIndex + limit,
      );

      setPayments(paginatedResults);
    } catch (error) {
      console.error("Error searching payments:", error);
      setPayments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchPayments(searchQuery, eventFilter, page, pageSize);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, eventFilter, page, pageSize]);

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, eventFilter]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    payments,
    loading,
    searchQuery,
    setSearchQuery,
    eventFilter,
    setEventFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
  };
}

// ============================================================
// Events Hook
// ============================================================

export function useEvents() {
  const [events, setEvents] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        // Collect events from the events table
        const baseEvents = await db.events.toArray();
        const eventMap = new Map();

        // Populate map with known events
        baseEvents.forEach((e) => {
          const id = e.event_id || e.id;
          if (id) eventMap.set(id, e);
        });

        // Also check payments and enrollments for any "missing" events
        const [payments, enrollments] = await Promise.all([
          db.payments.toArray(),
          db.enrollments.toArray(),
        ]);

        const extraIds = new Set<string>();
        payments.forEach((p) => {
          if (p.event_id || p.eventId) extraIds.add(p.event_id || p.eventId);
        });
        enrollments.forEach((e) => {
          if (e.event_id || e.eventId) extraIds.add(e.event_id || e.eventId);
        });

        // Add placeholders for entries that exist in data but not in events table
        extraIds.forEach((id) => {
          if (!eventMap.has(id)) {
            eventMap.set(id, {
              event_id: id,
              name: `Event (${id.slice(0, 8)})`,
            });
          }
        });

        setEvents(Array.from(eventMap.values()));
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return { events, loading };
}
