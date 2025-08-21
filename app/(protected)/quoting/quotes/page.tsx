import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function QuotingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Quoting Tools</h2>
        <p className="text-gray-600">Select a state to begin generating insurance quotes and subsidy estimates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/quoting/quotes/alabama">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                Alabama
              </CardTitle>
              <CardDescription>
                ACA Marketplace quotes with subsidy calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Income-based subsidies
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Metal tier pricing
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Out-of-pocket estimates
                </div>
              </div>
              <div className="mt-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full inline-block">
                ACTIVE
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="opacity-60 cursor-not-allowed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🤠</span>
              Texas
            </CardTitle>
            <CardDescription>
              Coming in Week 2
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                Income-based subsidies
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                Metal tier pricing
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                Out-of-pocket estimates
              </div>
            </div>
            <div className="mt-4 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full inline-block">
              COMING SOON
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-60 cursor-not-allowed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🌴</span>
              Florida
            </CardTitle>
            <CardDescription>
              Coming in Week 3
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                Income-based subsidies
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                Metal tier pricing
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                Out-of-pocket estimates
              </div>
            </div>
            <div className="mt-4 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full inline-block">
              COMING SOON
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
