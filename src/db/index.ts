'use client'

// Export database instance and initialization
export { db, initDB, HackerzAppDB } from './dexie'

// Export types
export type {
  User,
  Event,
  Enrollment,
  Payment,
  EntryLog,
  Attendance,
  SyncMeta,
  Admin,
  CodeBlock,
} from './dexie'

// Export sync functions
export { syncPull } from './syncPull'
export { syncPush, pushSingleEntryLog } from './syncPush'

/**
 * Initialize the app database
 * This is a convenience wrapper around initDB
 */
export async function initializeAppDB() {
  try {
    const { initDB } = await import('./dexie')
    const result = await initDB()
    return result
  } catch (error) {
    console.error('DB init failed', error)
    return { success: false, error }
  }
}