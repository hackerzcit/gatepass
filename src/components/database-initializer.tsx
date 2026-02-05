'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { db, initializeAppDB, syncPull } from '@/db'
import type { Admin } from '@/db'

/**
 * DatabaseInitializer Component
 * 
 * Initializes the Dexie database and performs initial sync
 * when the user is authenticated.
 * 
 * This component should be placed in the dashboard layout
 * to ensure the database is ready before any dashboard pages load.
 */
export function DatabaseInitializer() {
  const { data: session, status } = useSession()
  const isInitialized = useRef(false)

  useEffect(() => {
    // Only run once when user is authenticated
    if (status === 'authenticated' && session?.user && !isInitialized.current) {
      isInitialized.current = true

      const initializeDatabase = async () => {
        try {
          console.log('🔧 Initializing database...')
          
          // Initialize the database
          const result = await initializeAppDB()
          
          if (result.success) {
            console.log('✅ Database initialized successfully')

            // Persist admin data from session to local DB
            const u = session.user as { adminId?: string; userId?: string; name?: string | null; email?: string | null; createdAt?: string; codeBlock?: Admin['code_block'] }
            const adminId = u.adminId ?? u.userId
            if (adminId && u.email) {
              const admin: Admin = {
                admin_id: adminId,
                name: u.name ?? '',
                email: u.email,
                created_at: u.createdAt ?? new Date().toISOString(),
                code_block: u.codeBlock ?? {
                  id: '',
                  admin_id: adminId,
                  range_start: 0,
                  range_end: 0,
                  current_value: 0,
                  updated_at: new Date().toISOString(),
                },
              }
              await db.admins.put(admin)
              console.log('✅ Admin data stored in local DB')
            }
            
            // Fetch the access token for API calls
            try {
              const tokenResponse = await fetch('/api/auth/get-token')
              if (tokenResponse.ok) {
                const { access_token } = await tokenResponse.json()
                
                // Perform initial sync
                console.log('🔄 Performing initial data sync...')
                const syncResult = await syncPull(access_token)
                
                if (syncResult.success) {
                  console.log('✅ Initial sync complete:', syncResult.counts)
                } else {
                  console.error('⚠️ Initial sync failed:', syncResult.error)
                }
              } else {
                console.warn('⚠️ Could not fetch access token, skipping initial sync')
              }
            } catch (tokenError) {
              console.error('⚠️ Error fetching token:', tokenError)
            }
          } else {
            console.error('❌ Database initialization failed:', result.error)
          }
        } catch (error) {
          console.error('❌ Unexpected error during database initialization:', error)
        }
      }

      initializeDatabase()
    }
  }, [status, session])

  // This component doesn't render anything
  return null
}