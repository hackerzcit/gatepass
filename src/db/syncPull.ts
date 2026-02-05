'use client'

import axios from 'axios'
import { db } from './dexie'
import type { User, Event, Enrollment, Payment } from './dexie'

// Backend API base URL (adjust as needed or use environment variable)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hackerz-app-backend-new-production.up.railway.app'
/**
 * Response type from the backend /sync/pull endpoint
 */
interface SyncPullResponse {
  data: {
    users?: User[]
    events?: Event[]
    enrollments?: Enrollment[]
    payments?: Payment[]
    timestamp: string
  }
}

/**
 * Result type for the syncPull function
 */
interface SyncPullResult {
  success: boolean
  counts?: {
    users: number
    events: number
    enrollments: number
    payments: number
  }
  error?: string
}

/**
 * PULL SYNC: Fetch updates from backend and store in Dexie
 * 
 * This function:
 * 1. Gets the last sync timestamp from local DB
 * 2. Sends it to backend via POST /sync/pull
 * 3. Backend returns only NEW or UPDATED records since that timestamp
 * 4. Upserts all records into Dexie (insert or update)
 * 5. Saves the new timestamp for next sync
 * 
 * @param authToken - Optional authentication token for the API request
 * @returns Promise with sync result containing counts or error
 */
export async function syncPull(authToken?: string): Promise<SyncPullResult> {
  try {
    console.log('🔄 Starting pull sync...')

    // STEP 1: Get last sync timestamp from local DB
    const syncMeta = await db.sync_meta.get('lastPulledAt')
    const lastPulledAt = syncMeta?.value || null // null = first-time sync (fetch all)

    console.log('📅 Last synced at:', lastPulledAt || 'Never')

    // STEP 2: Call backend API with timestamp
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const response = await axios.post<SyncPullResponse>(
      `${API_BASE_URL}/sync/pull`,
      { lastPulledAt },
      { headers }
    )

    console.log('📦 Response received from backend')

    const { users, events, enrollments, payments, timestamp } = response.data.data

    const counts = {
      users: users?.length || 0,
      events: events?.length || 0,
      enrollments: enrollments?.length || 0,
      payments: payments?.length || 0,
    }

    console.log('📦 Received from backend:', counts)

    // STEP 3: Upsert data into Dexie using a transaction
    // Transaction ensures ALL-or-NOTHING: either everything saves or nothing does
    await db.transaction(
      'rw',
      [db.users, db.events, db.enrollments, db.payments, db.sync_meta],
      async () => {
        
        // bulkPut = "insert or update" (upsert)
        // It uses the primary key to decide: if exists, update; if not, insert
        if (users && users.length > 0) {
          await db.users.bulkPut(users) // Uses 'user_id' as key
        }

        if (events && events.length > 0) {
          await db.events.bulkPut(events) // Uses 'event_id' as key
        }

        if (enrollments && enrollments.length > 0) {
          await db.enrollments.bulkPut(enrollments) // Uses 'enrollment_id' as key
        }

        if (payments && payments.length > 0) {
          await db.payments.bulkPut(payments) // Uses 'payment_id' as key
        }

        // STEP 4: Save the new timestamp for next sync
        await db.sync_meta.put({
          key: 'lastPulledAt',
          value: timestamp, // Backend sends current timestamp
        })
      }
    )

    console.log('✅ Pull sync complete!')

    return {
      success: true,
      counts,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Pull sync failed:', errorMessage)

    // Don't throw - return error info instead
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * WHY bulkPut?
 * 
 * - bulkPut is MUCH faster than individual put() calls
 * - It does UPSERT (insert OR update) automatically
 * - Uses the primary key to decide:
 *   - If user_id='abc' exists → UPDATE that record
 *   - If user_id='xyz' doesn't exist → INSERT new record
 * 
 * - This makes sync safe and idempotent:
 *   - You can run syncPull multiple times
 *   - Same data won't duplicate
 *   - Updates overwrite old data
 */
