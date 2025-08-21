import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Care Agency</h1>
          <p className="text-gray-600 mt-2">Insurance Management Platform</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
              card: 'shadow-lg',
              headerTitle: 'text-xl font-semibold',
              headerSubtitle: 'text-gray-600'
            }
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
