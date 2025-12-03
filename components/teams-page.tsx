"use client"

import { useCallback, useEffect, useState } from "react"
import PageHeader from "@/components/page-header"
import { TeamEditorModal } from "@/components/team-editor-modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/useAuth"

interface UserSummary {
  id: number
  name: string
  email: string
  profile_picture?: string | null
}

interface TeamMemberSummary extends UserSummary {
  role: "owner" | "member"
}

interface TeamMessage {
  id: number
  content: string
  created_at: string
  sender: UserSummary
}

interface TeamSummary {
  id: number
  title: string
  description: string
  role: "owner" | "member"
  status: string
  current_members: number
  max_members: number
  owner: UserSummary
  members: TeamMemberSummary[]
  latest_message?: TeamMessage | null
  created_at: string
  updated_at: string
}

interface TeamsPageProps {
  onBack: () => void
  onNavigateToProfile: () => void
  onSelectTeam: (teamId: number) => void
}

export default function TeamsPage({ onBack, onNavigateToProfile, onSelectTeam }: TeamsPageProps) {
  const { logout } = useAuth()
  const [teams, setTeams] = useState<TeamSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editorTeamId, setEditorTeamId] = useState<number | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.getMyTeams()
      if (Array.isArray(response)) {
        setTeams(response)
      } else {
        setTeams([])
      }
    } catch (err) {
      console.error("Failed to load teams:", err)
      setError("Failed to load your teams")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const openEditor = (teamId: number) => {
    setEditorTeamId(teamId)
    setIsEditorOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="My Teams"
        description="See every team you own or joined. Select a team to open its dedicated chat."
        onBack={onBack}
        onNavigateToProfile={onNavigateToProfile}
        onSignOut={logout}
      />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <p className="text-muted-foreground">Loading your teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">You are not part of any teams yet.</p>
            <p className="text-sm text-muted-foreground">Post a project or apply to a team to get started.</p>
            <Button onClick={onBack} className="mt-6">
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <Card key={team.id} className="border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {team.role === "owner" ? "Owner" : "Member"}
                    </p>
                    <h2 className="text-xl font-semibold text-foreground">{team.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{team.description}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Status: <span className="capitalize text-foreground">{team.status.toLowerCase()}</span></p>
                    <p>
                      Members: {team.current_members}/{team.max_members}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex flex-wrap gap-1">
                    {team.members.slice(0, 4).map((member) => (
                      <span key={member.id} className="rounded-full bg-secondary px-2 py-1 text-foreground">
                        {member.name}
                      </span>
                    ))}
                    {team.members.length > 4 && <span>+{team.members.length - 4} more</span>}
                  </div>
                  {team.latest_message ? (
                    <span className="italic text-muted-foreground/80">
                      Last message from {team.latest_message.sender.name}: {team.latest_message.content}
                    </span>
                  ) : (
                    <span className="italic text-muted-foreground/80">No messages yet</span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {team.role === "owner" && (
                      <Button
                        type="button"
                        className="border border-primary/50 bg-blue-900/30 text-blue-100 text-sm hover:bg-blue-900/40"
                        onClick={() => openEditor(team.id)}
                      >
                        Edit Details
                      </Button>
                    )}
                  </div>
                  <Button onClick={() => onSelectTeam(team.id)} className="text-sm">
                    Open Team Chat
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <TeamEditorModal
        teamId={editorTeamId}
        open={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false)
          setEditorTeamId(null)
        }}
        onSuccess={fetchTeams}
      />
    </div>
  )
}
