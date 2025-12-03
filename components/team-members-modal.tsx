"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProfileAvatar } from "@/components/profile-avatar"
import { api } from "@/lib/api"

interface TeamMemberSummary {
  id: number
  name: string
  email: string
  profile_picture?: string | null
  role: "owner" | "member"
}

interface TeamSummaryLite {
  id: number
  title: string
  members: TeamMemberSummary[]
}

interface TeamMembersModalProps {
  team: TeamSummaryLite | null
  open: boolean
  onClose: () => void
  onMemberRemoved?: () => void
}

export function TeamMembersModal({ team, open, onClose, onMemberRemoved }: TeamMembersModalProps) {
  const [members, setMembers] = useState<TeamMemberSummary[]>([])
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (team) {
      setMembers(team.members)
      setError(null)
    } else {
      setMembers([])
    }
  }, [team])

  if (!open || !team) {
    return null
  }

  const handleRemoveMember = async (memberId: number) => {
    if (memberId === team.members.find((m) => m.role === "owner")?.id) {
      return
    }

    const confirmed = window.confirm("Remove this member from the team? They will lose access immediately.")
    if (!confirmed) {
      return
    }

    try {
      setRemovingId(memberId)
      setError(null)
      await api.removeTeamMember(team.id, memberId)
      setMembers((prev) => prev.filter((member) => member.id !== memberId))
      onMemberRemoved?.()
    } catch (err) {
      console.error("Failed to remove member", err)
      setError("Unable to remove member. Please try again.")
    } finally {
      setRemovingId(null)
    }
  }

  const ownerId = members.find((member) => member.role === "owner")?.id

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="w-full max-w-2xl">
        <Card className="max-h-[80vh] overflow-y-auto border-2 border-primary/40 bg-card p-8 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Manage Team Members</h2>
              <p className="mt-1 text-sm text-muted-foreground">Remove collaborators who should no longer have access.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-transparent px-3 py-1 text-xl text-muted-foreground hover:border-border"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/20 p-4"
              >
                <div className="flex items-center gap-3">
                  <ProfileAvatar name={member.name} imageUrl={member.profile_picture} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-wide ${
                      member.role === "owner"
                        ? "border border-primary/50 text-primary"
                        : "border border-muted-foreground/40 text-muted-foreground"
                    }`}
                  >
                    {member.role}
                  </span>
                  {member.id !== ownerId && (
                    <Button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={removingId === member.id}
                      className="bg-red-600 text-white hover:bg-red-500 disabled:opacity-60"
                    >
                      {removingId === member.id ? "Removing..." : "Remove"}
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {members.length === 1 && (
              <p className="text-center text-sm text-muted-foreground">
                No additional members yet. Invite collaborators by accepting their requests.
              </p>
            )}
          </div>

          <div className="mt-8 border-t border-border pt-6 text-right">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
