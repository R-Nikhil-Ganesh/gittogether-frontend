"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/useAuth"

export default function CallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Processing authentication...")
  const { setUser } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        
        if (!token) {
          throw new Error("No token received from authentication")
        }

        // Store the token
        localStorage.setItem('access_token', token)
        
        // Fetch user information using the token
        const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/+$/, '')
        const response = await fetch(`${apiBase}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Failed to fetch user info:', response.status, errorText)
          throw new Error(`Failed to fetch user information: ${response.status}`)
        }

        const userData = await response.json()
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        
        setStatus("Authentication successful! Redirecting...")
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
        
      } catch (error) {
        console.error('Authentication callback failed:', error)
        setStatus("Authentication failed. Redirecting to login...")
        
        // Clear any stored data and redirect to home
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    }

    handleCallback()
  }, [router, setUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}