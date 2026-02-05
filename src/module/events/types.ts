import type { User as DexieUser, Event as DexieEvent, Enrollment as DexieEnrollment, Payment as DexiePayment, Attendance as DexieAttendance, EntryLog as DexieEntryLog } from '@/db/dexie';

// Re-export types from Dexie
export type User = DexieUser;
export type Event = DexieEvent;
export type Enrollment = DexieEnrollment;
export type Payment = DexiePayment;
export type Attendance = DexieAttendance;
export type EntryLog = DexieEntryLog;

// ============================================================
// Mutation Types
// ============================================================

/**
 * Variables for marking attendance
 */
export interface MarkAttendanceVariables {
  uniqueCode: string;
  userName: string;
}

/**
 * Attendance data structure including marked unique codes
 */
export interface AttendanceData {
  markedUniqueCodes: Set<string>;
  [key: string]: any;
}

// ============================================================
// Query Key Types
// ============================================================

export type EventsQueryKey = readonly ["events"];
export type EventDetailQueryKey = readonly ["events", string];
export type EventEnrollmentsQueryKey = readonly ["events", string, "enrollments"];
export type EventUsersQueryKey = readonly ["events", string, "users"];
export type EventAttendanceQueryKey = readonly ["events", string, "attendance"];
export type UserSearchQueryKey = readonly ["users", "search", string];

// ============================================================
// API Response Types
// ============================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Token response from authentication endpoint
 */
export interface TokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

/**
 * Response from /sync/pull endpoint
 */
export interface SyncPullResponse {
  data: {
    users?: User[];
    events?: Event[];
    enrollments?: Enrollment[];
    payments?: Payment[];
    timestamp: string;
  };
}

/**
 * Response from /sync/push endpoint
 */
export interface SyncPushResponse {
  success: boolean;
  message: string;
  data: {
    users: { total: number; processed: number };
    entries: { total: number; processed: number };
    attendance: { total: number; processed: number };
    errors?: string[];
  };
}
