"use client";

import { axiosBackendInstance } from "@/lib/axios-instance";
import { useCallback, useState } from "react";

// ============================================================
// Types (matches backend GET /analytics/dashboard response)
// ============================================================

export interface AnalyticsOverview {
  totalUsers: number;
  totalEvents: number;
  totalEntryLogs: number;
  totalAttendance: number;
  totalPayments: number;
  totalPaymentAmount: string;
}

export interface GenderDistribution {
  gender: string;
  count: number;
}

export interface DepartmentDistribution {
  department: string;
  count: number;
}

export interface YearDistribution {
  year: string;
  count: number;
}

export interface AnalyticsUsers {
  onlineUsers: number;
  onspotUsers: number;
  genderDistribution: GenderDistribution[];
  departmentDistribution: DepartmentDistribution[];
  yearDistribution: YearDistribution[];
}

export interface EventWiseAttendance {
  event_id: string;
  event_name: string;
  is_paid: boolean;
  is_team: boolean;
  attendanceCount: number;
  enrollmentCount: number;
}

export interface TopEvent {
  event_id: string;
  event_name: string;
  attendanceCount: number;
}

export interface AnalyticsEvents {
  eventWiseAttendance: EventWiseAttendance[];
  topEvents: TopEvent[];
}

export interface AnalyticsPayments {
  totalAmount: string;
  totalCount: number;
  completedPayments: number;
  pendingPayments: number;
  averagePayment: string;
}

export interface SourceDistribution {
  source: string;
  count: number;
}

export interface RecentEntry {
  entry_id: string;
  unique_code: string;
  source: string;
  user_name: string;
  created_at: string;
}

export interface AnalyticsEntries {
  total: number;
  sourceDistribution: SourceDistribution[];
  recent: RecentEntry[];
}

export interface RecentAttendance {
  attendance_id: string;
  unique_code: string;
  user_name: string;
  event_name: string;
  created_at: string;
}

export interface AnalyticsAttendance {
  total: number;
  recent: RecentAttendance[];
}

export interface AnalyticsDashboardData {
  overview: AnalyticsOverview;
  users: AnalyticsUsers;
  events: AnalyticsEvents;
  payments: AnalyticsPayments;
  entries: AnalyticsEntries;
  attendance: AnalyticsAttendance;
  timestamp?: string;
}

export interface AnalyticsDashboardResponse {
  success: boolean;
  message: string;
  data: AnalyticsDashboardData;
}

// ============================================================
// Hook
// ============================================================

export function useAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosBackendInstance.get<AnalyticsDashboardResponse>("/analytics/dashboard");
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        setError(new Error(res.data?.message || "Failed to load analytics"));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load analytics")
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refetch: fetchDashboard };
}
