"use client"

import RequestsSentPage from "@/components/requests-sent-page"
import AuthPage from "@/components/auth-page"
import { useAuth } from "@/lib/useAuth"
import { useRouter } from "next/navigation"

export default function RequestsSentRoute() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your requests...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <RequestsSentPage
      onBack={() => router.push("/dashboard")}
      onNavigateToProfile={() => router.push("/profile")}
    />
  )
}
