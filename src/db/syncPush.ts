'use client'

import { axiosBackendInstance } from '@/lib/axios-instance'
import { db } from './dexie'
import type { User, EntryLog, Attendance } from './dexie'

/**
 * Request body type for the backend /sync/push endpoint
 */
interface SyncPushRequest {
  users?: {
    created: User[]
  }
  entries?: {
    created: Array<{
      unique_code: string
      admin_id: string
      source: string
    }>
  }
  attendance?: {
    created: Array<{
      unique_code: string
      event_id: string
      admin_id: string
    }>
  }
}

/**
 * Response type from the backend /sync/push endpoint
 */
interface SyncPushResponse {
  success: boolean
  message: string
  data: {
    users: { total: number; processed: number }
    entries: { total: number; processed: number }
    attendance: { total: number; processed: number }
    errors?: string[]
  }
}

/**
 * Result type for the syncPush function
 */
interface SyncPushResult {
  success: boolean
  counts?: {
    users: { total: number; processed: number }
    entries: { total: number; processed: number }
    attendance: { total: number; processed: number }
  }
  errors?: string[]
  error?: string
}

/**
 * PUSH SYNC: Upload local changes to backend
 * 
 * This function:
 * 1. Gets all pending entry_logs, attendance, and users from local DB
 * 2. Sends them to backend via POST /sync/push
 * 3. Backend processes and stores them
 * 4. Marks successfully synced records as 'synced'
 * 5. Updates last push timestamp
 * 
 * @param authToken - Optional authentication token for the API request
 * @returns Promise with sync result containing counts or error
 */
export async function syncPush(authToken?: string): Promise<SyncPushResult> {
  try {
    console.log('🔄 Starting push sync...')

    // STEP 1: Get all pending data from local DB
    const [pendingEntryLogs, pendingAttendance] = await Promise.all([
      db.entry_logs.where('_sync_status').equals('pending').toArray(),
      db.attendance.where('_sync_status').equals('pending').toArray(),
    ])

    console.log('📦 Pending data:', {
      entryLogs: pendingEntryLogs.length,
      attendance: pendingAttendance.length,
    })

    // If nothing to sync, return early
    if (pendingEntryLogs.length === 0 && pendingAttendance.length === 0) {
      console.log('✅ Nothing to sync')
      return {
        success: true,
        counts: {
          users: { total: 0, processed: 0 },
          entries: { total: 0, processed: 0 },
          attendance: { total: 0, processed: 0 },
        },
      }
    }

    // STEP 2: Get users that need to be synced
    // Collect unique codes from entry logs
    const uniqueCodes = new Set<string>()
    pendingEntryLogs.forEach(log => uniqueCodes.add(log.unique_code))
    pendingAttendance.forEach(att => uniqueCodes.add(att.unique_code))

    // Get users for these codes
    const users = await db.users
      .where('unique_code')
      .anyOf(Array.from(uniqueCodes))
      .toArray()

    console.log('👥 Users to sync:', users.length)

    // Helper function to map local source values to backend enum values
    const mapSourceToBackendEnum = (source: string): string => {
      const sourceMap: Record<string, string> = {
        'dashboard': 'ONLINE',
        'onspot': 'ONSPOT',
        'ONLINE': 'ONLINE',
        'ONSPOT': 'ONSPOT',
      }
      return sourceMap[source.toLowerCase()] || 'ONSPOT' // Default to ONSPOT if unknown
    }

    // STEP 3: Prepare request body
    const requestBody: SyncPushRequest = {
      users: users.length > 0 ? { created: users } : undefined,
      entries: pendingEntryLogs.length > 0 ? {
        created: pendingEntryLogs.map(log => ({
          unique_code: log.unique_code,
          admin_id: log.admin_id,
          source: mapSourceToBackendEnum(log.source),
        }))
      } : undefined,
      attendance: pendingAttendance.length > 0 ? {
        created: pendingAttendance.map(att => ({
          unique_code: att.unique_code,
          event_id: att.event_id,
          admin_id: att.admin_id,
        }))
      } : undefined,
    }

    // STEP 4: Call backend API
    const headers: Record<string, string> = {}

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const response = await axiosBackendInstance.post<SyncPushResponse>('/sync/push', requestBody, { headers })

    console.log('📦 Response received from backend:', response.data)

    const { data } = response.data

    // STEP 5: Mark successfully synced records
    // We mark all as synced since backend handles upsert and errors gracefully
    await db.transaction(
      'rw',
      [db.entry_logs, db.attendance, db.sync_meta],
      async () => {
        // Update entry logs status
        if (data.entries.processed > 0) {
          const syncedEntryIds = pendingEntryLogs
            .slice(0, data.entries.processed)
            .map(log => log.id!)
            .filter(id => id !== undefined)

          for (const id of syncedEntryIds) {
            await db.entry_logs.update(id, { _sync_status: 'synced' })
          }
        }

        // Update attendance status
        if (data.attendance.processed > 0) {
          const syncedAttendanceIds = pendingAttendance
            .slice(0, data.attendance.processed)
            .map(att => att.id!)
            .filter(id => id !== undefined)

          for (const id of syncedAttendanceIds) {
            await db.attendance.update(id, { _sync_status: 'synced' })
          }
        }

        // Save last push timestamp
        await db.sync_meta.put({
          key: 'lastPushedAt',
          value: new Date().toISOString(),
        })
      }
    )

    console.log('✅ Push sync complete!')

    return {
      success: true,
      counts: {
        users: data.users,
        entries: data.entries,
        attendance: data.attendance,
      },
      errors: data.errors,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Push sync failed:', errorMessage)

    // Don't throw - return error info instead
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * PUSH SINGLE ENTRY LOG: Upload a single entry log to backend immediately
 * 
 * This function is used for immediate sync when creating entry logs while online.
 * It's separate from the batch syncPush for better user experience.
 * 
 * @param entryLogId - The ID of the entry log to push
 * @param authToken - Optional authentication token for the API request
 * @returns Promise with success status and error if any
 */
export async function pushSingleEntryLog(entryLogId: number, authToken?: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🔄 Pushing single entry log (ID: ${entryLogId})...`)

    // Get the entry log from local DB
    const entryLog = await db.entry_logs.get(entryLogId)
    if (!entryLog) {
      throw new Error('Entry log not found')
    }

    // Get the user for this entry log
    const user = await db.users.where('unique_code').equals(entryLog.unique_code).first()
    if (!user) {
      throw new Error('User not found for entry log')
    }

    // Helper function to map local source values to backend enum values
    const mapSourceToBackendEnum = (source: string): string => {
      const sourceMap: Record<string, string> = {
        'dashboard': 'ONLINE',
        'onspot': 'ONSPOT',
        'ONLINE': 'ONLINE',
        'ONSPOT': 'ONSPOT',
      }
      return sourceMap[source.toLowerCase()] || 'ONSPOT'
    }

    // Prepare request body
    const requestBody = {
      users: { created: [user] },
      entries: {
        created: [{
          unique_code: entryLog.unique_code,
          admin_id: entryLog.admin_id,
          source: mapSourceToBackendEnum(entryLog.source),
        }]
      }
    }

    // Call backend API
    const headers: Record<string, string> = {}

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const response = await axiosBackendInstance.post<SyncPushResponse>('/sync/push', requestBody, { headers })

    console.log('✅ Entry log pushed successfully:', response.data)

    // Update entry log status to synced
    await db.entry_logs.update(entryLogId, { _sync_status: 'synced' })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Failed to push single entry log:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * WHY separate syncPush from syncPull?
 * 
 * - Pull = Download data FROM server (users, events, enrollments, payments)
 * - Push = Upload data TO server (entry logs, attendance, on-spot users)
 * 
 * - They handle different data flows:
 *   - Pull: Read-only, updates local cache
 *   - Push: Write-only, submits local changes
 * 
 * - Push uses _sync_status to track what needs uploading
 *   - 'pending' = not yet synced to server
 *   - 'synced' = successfully uploaded
 * 
 * - This allows offline-first workflow:
 *   - Record attendance offline
 *   - Data marked as 'pending'
 *   - When online, push syncs it
 *   - Mark as 'synced' on success
 */