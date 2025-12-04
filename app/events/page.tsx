"use client"

import DiscoverEventsPage from "@/components/discover-events-page"
import AuthPage from "@/components/auth-page"
import { useAuth } from "@/lib/useAuth"
import { useRouter } from "next/navigation"

export default function EventsRoute() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <DiscoverEventsPage
      onBack={() => router.push("/dashboard")}
      onNavigateToProfile={() => router.push("/profile")}
    />
  )
}
