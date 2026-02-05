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
        const error = err instanceof Error ? err : new Error("Failed to fetch stats");
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
// Add more hooks and queries below as needed
// ============================================================
