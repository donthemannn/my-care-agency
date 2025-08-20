'use client'

import { useState, useEffect } from 'react'

interface SystemStatus {
  cms: boolean
  smartystreets: boolean
  database: boolean
  alabama: boolean
}

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    cms: false,
    smartystreets: false,
    database: false,
    alabama: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Check if environment variables are present
        const hasEnvVars = typeof window !== 'undefined' && 
          process.env.NEXT_PUBLIC_SUPABASE_URL && 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        setStatus({
          cms: !!process.env.CMS_API_KEY,
          smartystreets: !!process.env.SMARTYSTREETS_AUTH_ID && !!process.env.SMARTYSTREETS_AUTH_TOKEN,
          database: !!hasEnvVars,
          alabama: true // Alabama data is built-in
        })
      } catch (error) {
        console.error('Status check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSystemStatus()
  }, [])

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
        <div className="animate-pulse">
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const StatusBadge = ({ isOnline, label }: { isOnline: boolean; label: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isOnline 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isOnline ? '✓ Connected' : '✗ Offline'}
      </span>
    </div>
  )

  const allSystemsOnline = Object.values(status).every(Boolean)

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">System Status</h3>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          allSystemsOnline 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {allSystemsOnline ? '🟢 All Systems Online' : '🟡 Partial Service'}
        </div>
      </div>
      
      <div className="space-y-1">
        <StatusBadge isOnline={status.cms} label="CMS Marketplace API" />
        <StatusBadge isOnline={status.smartystreets} label="SmartyStreets API" />
        <StatusBadge isOnline={status.database} label="Database Connection" />
        <StatusBadge isOnline={status.alabama} label="Alabama Plan Data" />
      </div>

      {!allSystemsOnline && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            Some services are offline. Check your environment variables and API keys.
          </p>
        </div>
      )}
    </div>
  )
}
