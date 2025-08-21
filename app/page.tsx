import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-gradient">
            My Care Agency
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Professional insurance management platform for agents and agencies. 
            Streamline your workflow with powerful quoting tools and client management.
          </p>
          
          <div className="space-y-4">
            <SignedOut>
              <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  Sign In to Dashboard
                </button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <div className="flex items-center justify-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Go to Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
          
          <div className="mt-16 grid gap-8 max-w-5xl mx-auto md:grid-cols-3">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Alabama Quoting</h3>
              <p className="text-gray-600 leading-relaxed">Get accurate ACA marketplace quotes for Alabama residents with real-time pricing.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Client Management</h3>
              <p className="text-gray-600 leading-relaxed">Organize and track your clients with our comprehensive CRM tools.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Secure & Compliant</h3>
              <p className="text-gray-600 leading-relaxed">Built with security and compliance in mind for insurance professionals.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Version Badge */}
      <div className="fixed bottom-4 right-4 bg-gradient-to-r from-gray-900 to-black text-white px-4 py-2 rounded-full text-xs font-mono backdrop-blur-md shadow-2xl border border-gray-700">
        {process.env.NEXT_PUBLIC_APP_VERSION || 'v8.1'}
      </div>
    </div>
  )
}
