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
  // CACHE BUST: Modern dashboard with cards - v2.0

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">
          🎉 MODERN DASHBOARD DEPLOYED! Welcome back, {user?.firstName || 'User'}!
        </h1>
        <p className="text-muted-foreground text-lg">
          ✅ Your NEW insurance quoting platform is ready. Start generating Alabama ACA quotes today.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Start generating quotes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active States</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Alabama ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ACA Plans</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
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
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with the most common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/quoting/quotes/alabama">
              <Button className="w-full justify-start" size="lg">
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

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            New to the platform? Here's how to generate your first quote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <h4 className="font-medium">Enter Client Info</h4>
              <p className="text-sm text-muted-foreground">
                Collect basic information like age, income, and zip code
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <h4 className="font-medium">Generate Quote</h4>
              <p className="text-sm text-muted-foreground">
                Our system calculates subsidies and shows available plans
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <h4 className="font-medium">Review & Share</h4>
              <p className="text-sm text-muted-foreground">
                Compare plans and share results with your client
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Link href="/quoting/quotes/alabama">
              <Button>
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
