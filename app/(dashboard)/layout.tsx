'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', current: false },
  { name: 'Quoting Tools', href: '/features/quoting', current: false },
  { name: 'Settings', href: '/settings', current: false },
]

const comingSoon = [
  { name: 'Training', href: '#', current: false },
  { name: 'AI Assistant', href: '#', current: false },
  { name: 'Customers', href: '#', current: false },
  { name: 'Reports', href: '#', current: false },
  { name: 'Compliance', href: '#', current: false },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          router.push('/login')
        } else {
          setUser(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="flex flex-col h-screen">
            {/* Logo */}
            <div className="flex items-center h-16 px-4 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-900">My Care Agency</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              <div className="mb-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Working Features
                </h3>
                <div className="mt-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          isActive
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          'group flex items-center px-3 py-2 text-sm font-medium border-l-4'
                        )}
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Coming Soon
                </h3>
                <div className="mt-2 space-y-1">
                  {comingSoon.map((item) => (
                    <div
                      key={item.name}
                      className="group flex items-center px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                    >
                      {item.name}
                      <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                        Soon
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </nav>

            {/* User info */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">Licensed Agent</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-3 text-xs text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
