"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthPage from "@/components/auth-page"
import TeamsPage from "@/components/teams-page"
import { useAuth } from "@/lib/useAuth"

export default function TeamsRoute() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading teams...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <TeamsPage
      onBack={() => router.push("/dashboard")}
      onNavigateToProfile={() => router.push("/profile")}
      onSelectTeam={(teamId) => router.push(`/teams/${teamId}`)}
    />
  )
}
