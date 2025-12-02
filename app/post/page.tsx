"use client"

import PostTeamView from "@/components/post-team-view"
import AuthPage from "@/components/auth-page"
import { useAuth } from "@/lib/useAuth"
import { useRouter } from "next/navigation"

export default function PostRoute() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Preparing form...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <PostTeamView
      onBack={() => router.push("/dashboard")}
      onNavigateToProfile={() => router.push("/profile")}
    />
  )
}
