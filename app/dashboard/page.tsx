"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardPage from "@/components/dashboard-page"
import AuthPage from "@/components/auth-page"
import { useAuth } from "@/lib/useAuth"

export default function DashboardRoute() {
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
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <DashboardPage
      onNavigateToProfile={() => router.push("/profile")}
      onNavigateToRequestsSent={() => router.push("/requests/sent")}
      onNavigateToMyRequests={() => router.push("/requests/mine")}
      onNavigateToFindTeam={() => router.push("/find")}
      onNavigateToPostTeam={() => router.push("/post")}
      onNavigateToTeams={() => router.push("/teams")}
      onNavigateToAdmin={() => router.push("/admin")}
    />
  )
}
