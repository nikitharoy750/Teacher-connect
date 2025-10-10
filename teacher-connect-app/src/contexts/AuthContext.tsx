import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSupabase } from './SupabaseContext'
import type { User } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, role: 'teacher' | 'student') => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { supabase } = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
    const isDemoMode = supabaseUrl.includes('demo')

    if (isDemoMode) {
      // Load demo user from localStorage
      const demoUser = localStorage.getItem('demo_user')
      const demoSession = localStorage.getItem('demo_session')

      if (demoUser && demoSession) {
        setUser(JSON.parse(demoUser))
        setSession(JSON.parse(demoSession))
      }
      setLoading(false)
      return
    }

    // Real Supabase session handling
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes (only in real Supabase mode)
    if (!isDemoMode) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
        setSession(session)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setLoading(false)
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [supabase])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        // For demo purposes, create a mock user if profile doesn't exist
        const mockUser: User = {
          id: userId,
          email: session?.user?.email || '',
          role: 'student',
          full_name: 'Demo User',
          created_at: new Date().toISOString(),
          credits: 0
        }
        setUser(mockUser)
      } else {
        setUser(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'teacher' | 'student') => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
    const isDemoMode = supabaseUrl.includes('demo')

    if (isDemoMode) {
      // Demo mode sign up - just create a mock user
      const mockUser: User = {
        id: `demo-${role}-${Date.now()}`,
        email,
        role,
        full_name: fullName,
        created_at: new Date().toISOString(),
        credits: role === 'student' ? 0 : undefined
      }

      setUser(mockUser)
      setSession({
        access_token: 'demo-token',
        refresh_token: 'demo-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser as any
      } as Session)

      // Store in localStorage for persistence
      localStorage.setItem('demo_user', JSON.stringify(mockUser))
      localStorage.setItem('demo_session', JSON.stringify({ user: mockUser }))

      return
    }

    // Real Supabase sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    // In a real app, you'd create the user profile in the database
    // For demo purposes, we'll just set a mock user
    if (data.user) {
      const newUser: User = {
        id: data.user.id,
        email,
        role,
        full_name: fullName,
        created_at: new Date().toISOString(),
        credits: role === 'student' ? 0 : undefined
      }
      setUser(newUser)
    }
  }

  const signIn = async (email: string, password: string) => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
    const isDemoMode = supabaseUrl.includes('demo')

    if (isDemoMode) {
      // Demo mode authentication
      const demoUsers = [
        { email: 'teacher@demo.com', password: 'password', role: 'teacher', name: 'Demo Teacher' },
        { email: 'student@demo.com', password: 'password', role: 'student', name: 'Demo Student' }
      ]

      const demoUser = demoUsers.find(u => u.email === email && u.password === password)
      if (!demoUser) {
        throw new Error('Invalid email or password')
      }

      // Create mock user session
      const mockUser: User = {
        id: `demo-${demoUser.role}-${Date.now()}`,
        email: demoUser.email,
        role: demoUser.role as 'teacher' | 'student',
        full_name: demoUser.name,
        created_at: new Date().toISOString(),
        credits: demoUser.role === 'student' ? 100 : undefined
      }

      setUser(mockUser)
      setSession({
        access_token: 'demo-token',
        refresh_token: 'demo-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser as any
      } as Session)

      // Store in localStorage for persistence
      localStorage.setItem('demo_user', JSON.stringify(mockUser))
      localStorage.setItem('demo_session', JSON.stringify({ user: mockUser }))

      return
    }

    // Real Supabase authentication
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signOut = async () => {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
    const isDemoMode = supabaseUrl.includes('demo')

    if (isDemoMode) {
      // Demo mode sign out
      setUser(null)
      setSession(null)
      localStorage.removeItem('demo_user')
      localStorage.removeItem('demo_session')
      return
    }

    // Real Supabase sign out
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setSession(null)
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
