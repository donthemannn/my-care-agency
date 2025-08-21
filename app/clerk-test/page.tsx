'use client'

import { useUser } from '@clerk/nextjs'

export default function ClerkTestPage() {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) {
    return <div>Loading Clerk...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Clerk Test Page</h1>
      <div className="space-y-2">
        <p><strong>Is Loaded:</strong> {isLoaded ? 'Yes' : 'No'}</p>
        <p><strong>Is Signed In:</strong> {isSignedIn ? 'Yes' : 'No'}</p>
        <p><strong>User ID:</strong> {user?.id || 'None'}</p>
        <p><strong>Email:</strong> {user?.emailAddresses?.[0]?.emailAddress || 'None'}</p>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Environment Check</h2>
        <p><strong>Publishable Key:</strong> {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Missing'}</p>
      </div>
    </div>
  )
}
