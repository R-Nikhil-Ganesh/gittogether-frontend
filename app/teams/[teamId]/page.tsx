"use client"

import { use, useMemo } from "react"
import { useRouter } from "next/navigation"
import AuthPage from "@/components/auth-page"
import TeamChatPage from "@/components/team-chat-page"
import { useAuth } from "@/lib/useAuth"

interface TeamChatRouteProps {
  params: Promise<{
    teamId: string
  }>
}

export default function TeamChatRoute({ params }: TeamChatRouteProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const resolvedParams = use(params)
  const numericTeamId = useMemo(() => Number(resolvedParams.teamId), [resolvedParams.teamId])

  if (Number.isNaN(numericTeamId)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Invalid team.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading team chat...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <TeamChatPage
      teamId={numericTeamId}
      onBack={() => router.push("/teams")}
      onNavigateToProfile={() => router.push("/profile")}
    />
  )
}
