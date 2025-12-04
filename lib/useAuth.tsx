"use client"

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { api } from '@/lib/api'

interface UserSkill {
  id: number
  name: string
  description?: string | null
  category?: string | null
}

interface User {
  id: number
  email: string
  name: string
  google_id: string
  profile_picture?: string | null
  bio?: string | null
  roll_number?: string | null
  department?: string | null
  year?: string | null
  linkedin?: string | null
  github?: string | null
  skills?: UserSkill[]
  created_at?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (userData: User | null) => void
  refreshUser: () => Promise<void>
  logout: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUserState(null)
  }, [])

  const setUser = useCallback((userData: User | null) => {
    setUserState(userData)
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setUser(null)
      return
    }

    try {
      const profile = await api.getProfile()
      setUser(profile)
    } catch (error) {
      console.error('Failed to refresh user profile:', error)
      logout()
    }
  }, [logout, setUser])

  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setIsLoading(false)
        return
      } catch (error) {
        console.error('Failed to parse stored user data:', error)
        localStorage.removeItem('user')
      }
    }

    await refreshUser()
    setIsLoading(false)
  }, [refreshUser, setUser])

  useEffect(() => {
    const handleAuthChange = () => {
      initializeAuth()
    }

    const handleForcedLogout = () => {
      logout()
    }

    initializeAuth()

    window.addEventListener('storage', handleAuthChange)
    window.addEventListener('auth-logout', handleForcedLogout as EventListener)

    return () => {
      window.removeEventListener('storage', handleAuthChange)
      window.removeEventListener('auth-logout', handleForcedLogout as EventListener)
    }
  }, [initializeAuth, logout])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser,
        refreshUser,
        logout,
        signOut: logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}