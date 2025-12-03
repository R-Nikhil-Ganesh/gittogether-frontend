"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthPage from "@/components/auth-page"
import LandingPage from "@/components/landing-page"
import { useAuth } from "@/lib/useAuth"

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return <LandingPage />
}
