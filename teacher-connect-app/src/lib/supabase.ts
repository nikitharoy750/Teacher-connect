import { createClient } from '@supabase/supabase-js'

// These would normally be environment variables
// For demo purposes, using placeholder values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  role: 'teacher' | 'student'
  full_name: string
  created_at: string
  credits?: number
}

export interface Video {
  id: string
  title: string
  description: string
  file_url: string
  audio_url?: string
  thumbnail_url?: string
  teacher_id: string
  subject: string
  grade_level: string
  duration: number
  upload_date: string
  upvotes: number
  views: number
}

export interface Test {
  id: string
  title: string
  description: string
  questions: Question[]
  teacher_id: string
  subject: string
  grade_level: string
  max_score: number
  time_limit: number
}

export interface Note {
  id: string
  title: string
  description: string
  file_url: string
  file_type: string
  file_size: number
  teacher_id: string
  subject: string
  grade_level: string
  upload_date: string
  downloads: number
  tags: string[]
}

export interface Module {
  id: string
  title: string
  description: string
  notes: Note[]
  teacher_id: string
  subject: string
  grade_level: string
  created_at: string
  is_published: boolean
}

export interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  points: number
}

export interface UserProgress {
  id: string
  user_id: string
  test_id?: string
  video_id?: string
  score?: number
  completed_at: string
  credits_earned: number
}
