import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
         style={{background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(224 231 255))'}}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6" style={{fontSize: '48px', fontWeight: '700', color: '#111827', marginBottom: '24px'}}>
            My Care Agency
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto" style={{fontSize: '20px', color: '#4b5563', marginBottom: '32px', maxWidth: '672px', margin: '0 auto 32px auto'}}>
            Professional insurance management platform for agents and agencies. 
            Streamline your workflow with powerful quoting tools and client management.
          </p>
          
          <div className="space-y-4">
            <SignedOut>
              <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                        style={{backgroundColor: '#2563eb', color: 'white', padding: '12px 32px', borderRadius: '8px', fontSize: '18px', fontWeight: '600'}}>
                  Sign In to Dashboard
                </button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <div className="flex items-center justify-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
                >
                  Go to Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
          
          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md" style={{backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}>
              <h3 className="text-xl font-semibold mb-3" style={{fontSize: '20px', fontWeight: '600', marginBottom: '12px'}}>Alabama Quoting</h3>
              <p className="text-gray-600" style={{color: '#4b5563'}}>Get accurate ACA marketplace quotes for Alabama residents with real-time pricing.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md" style={{backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}>
              <h3 className="text-xl font-semibold mb-3" style={{fontSize: '20px', fontWeight: '600', marginBottom: '12px'}}>Client Management</h3>
              <p className="text-gray-600" style={{color: '#4b5563'}}>Organize and track your clients with our comprehensive CRM tools.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md" style={{backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}>
              <h3 className="text-xl font-semibold mb-3" style={{fontSize: '20px', fontWeight: '600', marginBottom: '12px'}}>Secure & Compliant</h3>
              <p className="text-gray-600" style={{color: '#4b5563'}}>Built with security and compliance in mind for insurance professionals.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
