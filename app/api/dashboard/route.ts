import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        totalCustomers: 0,
        activeQuotes: 0,
        trainingProgress: 0,
        recentActivity: []
      })
    }
    
    // Get total customers count
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
    
    // Get active quotes count
    const { count: activeQuotes } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    
    // Get training progress (example calculation)
    const { data: trainingData } = await supabase
      .from('training_progress')
      .select('progress')
      .single()
    
    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    const dashboardData = {
      totalCustomers: totalCustomers || 0,
      activeQuotes: activeQuotes || 0,
      trainingProgress: trainingData?.progress || 0,
      recentActivity: recentActivity || []
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    
    // Return default values if database queries fail
    return NextResponse.json({
      totalCustomers: 0,
      activeQuotes: 0,
      trainingProgress: 0,
      recentActivity: []
    })
  }
}
