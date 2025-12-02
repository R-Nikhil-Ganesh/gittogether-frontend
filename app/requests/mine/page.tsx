"use client"

import MyRequestsPage from "@/components/my-requests-page"
import AuthPage from "@/components/auth-page"
import { useAuth } from "@/lib/useAuth"
import { useRouter } from "next/navigation"

export default function MyRequestsRoute() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your posts...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <MyRequestsPage
      onBack={() => router.push("/dashboard")}
      onNavigateToProfile={() => router.push("/profile")}
    />
  )
}
