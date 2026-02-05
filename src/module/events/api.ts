import type {
    SyncPullResponse,
    SyncPushResponse,
    TokenResponse,
    ApiResponse,
    Attendance,
    EntryLog,
  } from './types';
  
  // ============================================================
  // API Configuration
  // ============================================================
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
  
  class ApiClient {
    private baseUrl: string;
  
    constructor(baseUrl: string = API_BASE_URL) {
      this.baseUrl = baseUrl;
    }
  
    private async fetch<T>(
      endpoint: string,
      options?: RequestInit
    ): Promise<ApiResponse<T>> {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        });
  
        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }
  
        const data = await response.json();
        return {
          success: true,
          data,
        };
      } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  
    // ============================================================
    // Authentication APIs
    // ============================================================
  
    async getAccessToken(): Promise<TokenResponse> {
      const response = await this.fetch<TokenResponse>('/api/auth/get-token', {
        method: 'POST',
      });
  
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get access token');
      }
  
      return response.data;
    }
  
    // ============================================================
    // Sync APIs
    // ============================================================
  
    async syncPull(accessToken: string): Promise<SyncPullResponse> {
      const response = await this.fetch<SyncPullResponse>('/api/sync/pull', {
        method: 'POST',
        body: JSON.stringify({ access_token: accessToken }),
      });
  
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Sync pull failed');
      }
  
      return response.data;
    }
  
    async syncPushAttendance(
      accessToken: string,
      attendance: Attendance[]
    ): Promise<SyncPushResponse> {
      const response = await this.fetch<SyncPushResponse>(
        '/api/sync/push-attendance',
        {
          method: 'POST',
          body: JSON.stringify({
            access_token: accessToken,
            attendance,
          }),
        }
      );
  
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to push attendance');
      }
  
      return response.data;
    }
  
    async syncPushEntryLogs(
      accessToken: string,
      entryLogs: EntryLog[]
    ): Promise<SyncPushResponse> {
      const response = await this.fetch<SyncPushResponse>(
        '/api/sync/push-entry-logs',
        {
          method: 'POST',
          body: JSON.stringify({
            access_token: accessToken,
            entry_logs: entryLogs,
          }),
        }
      );
  
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to push entry logs');
      }
  
      return response.data;
    }
  
    // ============================================================
    // Events APIs (if you have server APIs)
    // ============================================================
  
    async getEvents() {
      return this.fetch('/api/events', {
        method: 'GET',
      });
    }
  
    async getEvent(eventId: string) {
      return this.fetch(`/api/events/${eventId}`, {
        method: 'GET',
      });
    }
  
    async getEventEnrollments(eventId: string) {
      return this.fetch(`/api/events/${eventId}/enrollments`, {
        method: 'GET',
      });
    }
  
    // ============================================================
    // Users APIs (if you have server APIs)
    // ============================================================
  
    async searchUsers(query: string, limit: number = 50) {
      return this.fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
        method: 'GET',
      });
    }
  
    async getUser(userId: string) {
      return this.fetch(`/api/users/${userId}`, {
        method: 'GET',
      });
    }
  }
  
  // ============================================================
  // Export singleton instance
  // ============================================================
  
  export const apiClient = new ApiClient();
  
  // ============================================================
  // Convenience functions (for backward compatibility)
  // ============================================================
  
  export const getAccessToken = () => apiClient.getAccessToken();
  export const syncPull = (accessToken: string) => apiClient.syncPull(accessToken);
  export const syncPushAttendance = (accessToken: string, attendance: Attendance[]) =>
    apiClient.syncPushAttendance(accessToken, attendance);
  export const syncPushEntryLogs = (accessToken: string, entryLogs: EntryLog[]) =>
    apiClient.syncPushEntryLogs(accessToken, entryLogs);