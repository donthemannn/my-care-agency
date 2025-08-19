'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // In development, redirect directly to dashboard
    if (process.env.NODE_ENV === 'development') {
      router.push('/dashboard')
      return
    }
    
    // In production, show login page (this would be implemented later)
    // For now, also redirect to dashboard
    router.push('/dashboard')
  }, [router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sean Insurance Pro</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
