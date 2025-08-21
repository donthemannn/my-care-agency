'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAVIGATION_ITEMS } from '@/config/features'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useClerk()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/sign-in')
    } catch (err) {
      console.error('Sign out failed', err)
    }
  }

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">My Care Agency</h1>
        <p className="text-sm text-gray-400">Insurance Management Platform</p>
      </div>
      
      <nav className="mt-6">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          if (item.comingSoon) {
            return (
              <div
                key={item.name}
                className="flex items-center px-6 py-3 text-gray-500 cursor-not-allowed"
                aria-disabled="true"
                tabIndex={-1}
              >
                <span>{item.name}</span>
                <span className="ml-auto text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">
                  Coming Soon
                </span>
              </div>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.name}
              {item.phase && (
                <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                  Phase {item.phase}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-700">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
