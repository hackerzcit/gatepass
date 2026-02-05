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

// Allowed Event IDs for filter
const ALLOWED_EVENT_IDS = [
  "cmk00z5yy001f11hx2zy2f0b4",
  "cmk00vh53001d11hxj4w6yfct",
  "cmk00klfv001911hxi0vvpgsi",
  "cmk00hkxn001311hxh3qkl5bo",
  "cmk00eke8001011hxav2iryjn",
  "cmk00aeqo000s11hxh8gka0pn",
  "cmk006rg0000q11hxyagxkhi8",
];

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
// Entry Log Users Search Hook
// ============================================================

export function useEntryLogUsersSearch() {
  const [users, setUsers] = useState<Array<any>>([]);
  const [allUsers, setAllUsers] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 50;

  const loadAllEntryLogUsers = async () => {
    try {
      setLoading(true);

      // Get unique codes from entry logs
      const entryLogs = await db.entry_logs.toArray();
      const uniqueCodes = Array.from(new Set(entryLogs.map((log) => log.unique_code)));

      // Get all users who have entry logs
      const results = await db.users
        .filter((user: User): boolean => {
          return uniqueCodes.includes(user.unique_code);
        })
        .toArray();

      setAllUsers(results);
      setTotalPages(Math.ceil(results.length / pageSize));
      
      // Set first page of users
      const paginatedUsers = results.slice(0, pageSize);
      setUsers(paginatedUsers);
    } catch (error) {
      console.error("Error loading entry log users:", error);
      setUsers([]);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const searchEntryLogUsers = async (query: string) => {
    if (!query.trim()) {
      // Reset to showing all users with pagination
      const paginatedUsers = allUsers.slice(0, pageSize);
      setUsers(paginatedUsers);
      setCurrentPage(1);
      setTotalPages(Math.ceil(allUsers.length / pageSize));
      setLoading(false);
      return;
    }

    try {
      const lowerQuery = query.toLowerCase().trim();

      // Search in all entry log users
      const results = allUsers.filter((user: User): boolean => {
        return !!(
          user.user_id?.toLowerCase().includes(lowerQuery) ||
          user.unique_code?.toLowerCase().includes(lowerQuery) ||
          user.email?.toLowerCase().includes(lowerQuery) ||
          user.mobile_number?.toLowerCase().includes(lowerQuery) ||
          user.name?.toLowerCase().includes(lowerQuery)
        );
      });

      setUsers(results.slice(0, pageSize));
      setCurrentPage(1);
      setTotalPages(Math.ceil(results.length / pageSize));
      setLoading(false);
    } catch (error) {
      console.error("Error searching entry log users:", error);
      setUsers([]);
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    setCurrentPage(page);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    if (searchQuery.trim()) {
      // If searching, filter first then paginate
      const lowerQuery = searchQuery.toLowerCase().trim();
      const filtered = allUsers.filter((user: User): boolean => {
        return !!(
          user.user_id?.toLowerCase().includes(lowerQuery) ||
          user.unique_code?.toLowerCase().includes(lowerQuery) ||
          user.email?.toLowerCase().includes(lowerQuery) ||
          user.mobile_number?.toLowerCase().includes(lowerQuery) ||
          user.name?.toLowerCase().includes(lowerQuery)
        );
      });
      setUsers(filtered.slice(startIndex, endIndex));
    } else {
      // Show all users with pagination
      setUsers(allUsers.slice(startIndex, endIndex));
    }
  };

  // Load all users on mount
  useEffect(() => {
    loadAllEntryLogUsers();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (allUsers.length === 0) return; // Wait for initial load
    
    setLoading(true);
    const debounceTimer = setTimeout(() => {
      searchEntryLogUsers(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, allUsers]);

  return { 
    users, 
    loading, 
    searchQuery, 
    setSearchQuery,
    currentPage,
    totalPages,
    goToPage,
    totalUsers: allUsers.length
  };
}

// ============================================================
// Add more hooks and queries below as needed
// ============================================================
