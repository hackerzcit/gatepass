'use client'

import Dexie, { type EntityTable } from 'dexie'

// Define types for our database tables
export interface User {
  user_id: string
  unique_code: string
  name: string
  email: string
  mobile_number: string
  department: string
  gender: string
  year: string
  college: string
  is_online_user: boolean
  created_at: string
  updated_at: string
  [key: string]: any
}

export interface Event {
  event_id: string
  name?: string
  description?: string
  [key: string]: any
}

export interface Enrollment {
  enrollment_id: string
  user_id: string
  event_id: string
  team_id?: string
  [key: string]: any
}

export interface Payment {
  payment_id: string
  user_id: string
  event_id: string
  amount?: number
  [key: string]: any
}

export interface EntryLog {
  id?: number
  unique_code: string
  admin_id: string
  source: string
  created_at: string
  _sync_status: 'pending' | 'synced'
  [key: string]: any
}

export interface Attendance {
  id?: number
  unique_code: string
  event_id: string
  admin_id: string
  created_at: string
  _sync_status: 'pending' | 'synced'
  [key: string]: any
}

export interface SyncMeta {
  key: string
  value: string | null
}

export interface CodeBlock {
  id: string
  admin_id: string
  range_start: number
  range_end: number
  current_value: number
  updated_at: string
}

export interface Admin {
  admin_id: string
  name: string
  email: string
  created_at: string
  code_block: CodeBlock
}

// Define the database with typed tables
export class HackerzAppDB extends Dexie {
  users!: EntityTable<User, 'user_id'>
  events!: EntityTable<Event, 'event_id'>
  enrollments!: EntityTable<Enrollment, 'enrollment_id'>
  payments!: EntityTable<Payment, 'payment_id'>
  entry_logs!: EntityTable<EntryLog, 'id'>
  attendance!: EntityTable<Attendance, 'id'>
  sync_meta!: EntityTable<SyncMeta, 'key'>
  admins!: EntityTable<Admin, 'admin_id'>

  constructor() {
    super('hackerz_app_db')

    // Schema version 1: Initial schema
    this.version(1).stores({
      users: 'user_id, unique_code, email',
      events: 'event_id',
      enrollments: 'enrollment_id, user_id, event_id',
      payments: 'payment_id, user_id, event_id',
      entry_logs: '++id, unique_code, admin_id, source, created_at, _sync_status',
      attendance: '++id, unique_code, event_id, admin_id, created_at, _sync_status',
      sync_meta: 'key'
    })

    // Schema version 2: Add mobile_number index to users, team_id to enrollments
    this.version(2).stores({
      users: 'user_id, unique_code, email, mobile_number',  
      events: 'event_id',
      enrollments: 'enrollment_id, user_id, event_id, team_id',
      payments: 'payment_id, user_id, event_id',
      entry_logs: '++id, unique_code, admin_id, source, created_at, _sync_status',
      attendance: '++id, unique_code, event_id, admin_id, created_at, _sync_status',
      sync_meta: 'key'
    })

    // Schema version 3: Add admins table for current admin / login data
    this.version(3).stores({
      users: 'user_id, unique_code, email, mobile_number',
      events: 'event_id',
      enrollments: 'enrollment_id, user_id, event_id, team_id',
      payments: 'payment_id, user_id, event_id',
      entry_logs: '++id, unique_code, admin_id, source, created_at, _sync_status',
      attendance: '++id, unique_code, event_id, admin_id, created_at, _sync_status',
      sync_meta: 'key',
      admins: 'admin_id, email'
    })
  }
}

// Create database instance
export const db = new HackerzAppDB()

/**
 * Initialize the database
 * Call this when the app starts
 */
export async function initDB() {
  try {
    await db.open()
    console.log('✅ Dexie DB opened')
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to open Dexie DB:', error)
    return { success: false, error }
  }
}