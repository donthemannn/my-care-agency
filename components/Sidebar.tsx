'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAVIGATION_ITEMS } from '@/config/features'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">My Care Agency</h1>
        <p className="text-sm text-gray-600">Insurance Management Platform</p>
      </div>
      
      <nav className="mt-6">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          
          if (item.comingSoon) {
            return (
              <div
                key={item.name}
                className="flex items-center px-6 py-3 text-gray-400 cursor-not-allowed"
              >
                <span>{item.name}</span>
                <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded">
                  Coming Soon
                </span>
              </div>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.name}
              {item.phase && (
                <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Phase {item.phase}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-6 border-t">
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
