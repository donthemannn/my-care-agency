import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export const supabase = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found, using mock client')
    return null
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
})()

export const createSupabaseClient = () => createClientComponentClient()

export const createSupabaseServerClient = () => {
  const { cookies } = require('next/headers')
  return createServerComponentClient({ cookies })
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'agent' | 'manager' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          role?: 'agent' | 'manager' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'agent' | 'manager' | 'admin'
          updated_at?: string
        }
      }
      carriers: {
        Row: {
          id: string
          name: string
          naic_code: string | null
          states: string[]
          commission_rate: number | null
          api_endpoint: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          naic_code?: string | null
          states: string[]
          commission_rate?: number | null
          api_endpoint?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          naic_code?: string | null
          states?: string[]
          commission_rate?: number | null
          api_endpoint?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      training_videos: {
        Row: {
          id: string
          title: string
          description: string | null
          r2_path: string
          duration: number | null
          category: string
          language: 'en' | 'es'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          r2_path: string
          duration?: number | null
          category: string
          language?: 'en' | 'es'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          r2_path?: string
          duration?: number | null
          category?: string
          language?: 'en' | 'es'
          is_active?: boolean
          updated_at?: string
        }
      }
      training_progress: {
        Row: {
          id: string
          user_id: string
          video_id: string
          completed_at: string | null
          progress_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          completed_at?: string | null
          progress_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          completed_at?: string | null
          progress_percentage?: number
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          state: string
          zip_code: string | null
          agent_id: string
          status: 'lead' | 'quoted' | 'enrolled' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          state: string
          zip_code?: string | null
          agent_id: string
          status?: 'lead' | 'quoted' | 'enrolled' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          state?: string
          zip_code?: string | null
          agent_id?: string
          status?: 'lead' | 'quoted' | 'enrolled' | 'inactive'
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          customer_id: string
          carrier_id: string
          plan_name: string
          premium: number
          state: string
          enrollment_date: string
          effective_date: string
          status: 'pending' | 'active' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          carrier_id: string
          plan_name: string
          premium: number
          state: string
          enrollment_date: string
          effective_date: string
          status?: 'pending' | 'active' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          carrier_id?: string
          plan_name?: string
          premium?: number
          state?: string
          enrollment_date?: string
          effective_date?: string
          status?: 'pending' | 'active' | 'cancelled'
          updated_at?: string
        }
      }
    }
  }
}
