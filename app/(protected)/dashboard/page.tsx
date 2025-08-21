'use client'

import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { 
  FileText, 
  TrendingUp, 
  MapPin, 
  CheckCircle, 
  Activity,
  Settings,
  ExternalLink
} from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Welcome back, {user?.firstName || 'Agent'}!
        </h1>
        <p className="text-gray-600 text-lg mt-2">
          Your professional insurance management platform is ready. Let's grow your business today.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Start generating quotes
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active States</CardTitle>
            <MapPin className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Alabama ready
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ACA Plans</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ready</div>
            <p className="text-xs text-muted-foreground">
              2025 plans loaded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
            <CardDescription>
              Get started with the most common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/quoting/quotes/alabama">
              <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300" size="lg">
                <FileText className="mr-2 h-4 w-4" />
                Generate Alabama Quote
              </Button>
            </Link>
            
            <Link href="/quoting/quotes">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Quote History
              </Button>
            </Link>
            
            <Link href="/settings">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">System Information</CardTitle>
            <CardDescription>
              Current system status and integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">CMS Marketplace API</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Connected</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">SmartyStreets API</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Connected</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Database</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Connected</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Alabama Plan Data</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Available</span>
            </div>

            <Separator />
            
            <div className="text-xs text-muted-foreground">
              All systems operational. Ready for production use.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Getting Started</CardTitle>
          <CardDescription>
            New to the platform? Here's how to generate your first quote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                1
              </div>
              <h4 className="font-medium">Enter Client Info</h4>
              <p className="text-sm text-muted-foreground">
                Collect basic information like age, income, and zip code
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                2
              </div>
              <h4 className="font-medium">Generate Quote</h4>
              <p className="text-sm text-muted-foreground">
                Our system calculates subsidies and shows available plans
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                3
              </div>
              <h4 className="font-medium">Review & Share</h4>
              <p className="text-sm text-muted-foreground">
                Compare plans and share results with your client
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Link href="/quoting/quotes/alabama">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                Start Your First Quote
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
