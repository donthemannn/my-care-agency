import { createSupabaseClient } from '@/lib/supabaseClient'

export interface DashboardData {
  totalContacts: number
  activeQuotes: number
  activeEnrollments: number
  recentActivities: RecentActivity[]
  trainingProgress: TrainingProgress
}

export interface RecentActivity {
  id: string
  type: 'customer' | 'enrollment' | 'quote'
  title: string
  description: string
  timestamp: string
}

export interface TrainingProgress {
  completedVideos: number
  totalVideos: number
  percentage: number
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = createSupabaseClient()

  try {
    const [
      { count: totalContacts },
      { count: activeQuotes },
      { count: activeEnrollments },
      { data: trainingVideos },
      { data: userProgress }
    ] = await Promise.all([
      supabase.from('contacts').select('*', { count: 'exact', head: true }),
      supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('training_videos').select('id').eq('is_active', true),
      supabase.from('training_progress').select('*').eq('user_id', userId).not('completed_at', 'is', null)
    ])

    const completedVideos = userProgress?.length || 0
    const totalVideos = trainingVideos?.length || 0
    const trainingPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0

    return {
      totalContacts: totalContacts || 0,
      activeQuotes: activeQuotes || 0,
      activeEnrollments: activeEnrollments || 0,
      recentActivities: [],
      trainingProgress: {
        completedVideos,
        totalVideos,
        percentage: trainingPercentage
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      totalContacts: 0,
      activeQuotes: 0,
      activeEnrollments: 0,
      recentActivities: [],
      trainingProgress: {
        completedVideos: 0,
        totalVideos: 0,
        percentage: 0
      }
    }
  }
}
