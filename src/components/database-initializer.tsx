'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { initializeAppDB, syncPull } from '@/db'

/**
 * DatabaseInitializer Component
 *
 * Initializes the Dexie database and performs initial sync
 * when the user is authenticated (admin in context).
 */
export function DatabaseInitializer() {
  const { admin, isReady } = useAuth()
  const isInitialized = useRef(false)

  useEffect(() => {
    if (!isReady || !admin || isInitialized.current) return;
    isInitialized.current = true;

    const initializeDatabase = async () => {
        try {
          console.log('🔧 Initializing database...')
          const result = await initializeAppDB()
          if (result.success) {
            console.log('✅ Database initialized successfully')
            if (!navigator.onLine) {
              console.log('⏭️ Skipping initial sync (offline); using local data')
              return
            }
            try {
              console.log('🔄 Performing initial data sync...')
              const syncResult = await syncPull(undefined)
              if (syncResult.success) {
                console.log('✅ Initial sync complete:', syncResult.counts)
              } else {
                console.error('⚠️ Initial sync failed:', syncResult.error)
              }
            } catch (syncError) {
              console.error('⚠️ Error during initial sync:', syncError)
            }
          } else {
            console.error('❌ Database initialization failed:', result.error)
          }
        } catch (error) {
          console.error('❌ Unexpected error during database initialization:', error)
        }
    };

    initializeDatabase();
  }, [isReady, admin]);

  // This component doesn't render anything
  return null
}