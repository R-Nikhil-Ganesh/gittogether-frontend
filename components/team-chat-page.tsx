"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import PageHeader from "@/components/page-header"
import { ProfileAvatar } from "@/components/profile-avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import UserProfileModal from "@/components/user-profile-modal"
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

interface TeamChatPageProps {
  teamId: number
  onBack: () => void
  onNavigateToProfile: () => void
}

export default function TeamChatPage({ teamId, onBack, onNavigateToProfile }: TeamChatPageProps) {
  const { user, logout } = useAuth()
  const [team, setTeam] = useState<TeamSummary | null>(null)
  const [messages, setMessages] = useState<TeamMessage[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [loadingTeam, setLoadingTeam] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileUserId, setProfileUserId] = useState<number | null>(null)
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null)

  const loadTeamDetails = useCallback(async () => {
    try {
      setLoadingTeam(true)
      const teams = await api.getMyTeams()
      if (Array.isArray(teams)) {
        const found = teams.find((candidate: TeamSummary) => candidate.id === teamId)
        if (!found) {
          setError("Team not found or you no longer have access")
          setTeam(null)
        } else {
          setTeam(found)
          setError(null)
        }
      } else {
        setTeam(null)
      }
    } catch (err) {
      console.error("Failed to load team details:", err)
      setError("Failed to load team details")
    } finally {
      setLoadingTeam(false)
    }
  }, [teamId])

  const loadMessages = useCallback(
    async (silent = false) => {
      if (!team) {
        return
      }

      try {
        if (!silent) {
          setLoadingMessages(true)
        }
        const response = await api.getTeamMessages(team.id)
        if (Array.isArray(response)) {
          setMessages(response)
        } else {
          setMessages([])
        }
      } catch (err) {
        console.error("Failed to load messages:", err)
        setError("Failed to load messages")
      } finally {
        if (!silent) {
          setLoadingMessages(false)
        }
      }
    },
    [team]
  )

  useEffect(() => {
    loadTeamDetails()
  }, [loadTeamDetails])

  useEffect(() => {
    if (!team) {
      setMessages([])
      return
    }

    loadMessages()
    const interval = setInterval(() => loadMessages(true), 10000)
    return () => clearInterval(interval)
  }, [team, loadMessages])

  const handleSendMessage = async () => {
    if (!team || !messageInput.trim()) {
      return
    }

    try {
      const trimmed = messageInput.trim()
      const newMessage = await api.sendTeamMessage(team.id, trimmed)
      setMessages((prev) => [...prev, newMessage])
      setMessageInput("")
    } catch (err) {
      console.error("Failed to send message:", err)
      setError("Failed to send message")
    }
  }

  const handleOpenProfile = (userId?: number) => {
    if (!userId) {
      return
    }
    setProfileUserId(userId)
  }

  const formatTimestamp = useMemo(
    () => (isoString: string) => {
      const date = new Date(isoString + (isoString.includes('Z') ? '' : 'Z'))
      return date.toLocaleString('en-IN', {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "numeric",
        timeZone: 'Asia/Kolkata'
      })
    },
    []
  )

  const handleRemoveMember = async (memberId: number) => {
    if (!team || team.role !== "owner" || memberId === user?.id) {
      return
    }

    const confirmed = window.confirm("Remove this member from the team? They will lose access to the chat.")
    if (!confirmed) {
      return
    }

    try {
      setRemovingMemberId(memberId)
      await api.removeTeamMember(team.id, memberId)
      await loadTeamDetails()
      await loadMessages(true)
    } catch (err) {
      console.error("Failed to remove member", err)
      setError("Failed to remove member")
    } finally {
      setRemovingMemberId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={team ? team.title : "Team Chat"}
        description="Collaborate with your teammates. Messages expire after one day."
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

        {loadingTeam ? (
          <div className="flex h-[40vh] items-center justify-center">
            <p className="text-muted-foreground">Loading team details...</p>
          </div>
        ) : !team ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">We could not find this team.</p>
            <Button onClick={onBack} className="mt-4">
              Back to Teams
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <Card className="border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{team.title}</h2>
                  <p className="text-sm text-muted-foreground">{team.description}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>Status: <span className="capitalize text-foreground">{team.status.toLowerCase()}</span></p>
                  <p>Members: {team.current_members}/{team.max_members}</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-muted-foreground">Team Members</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                        member.id === user?.id
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-border bg-secondary text-foreground"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenProfile(member.id)}
                        className="flex items-center gap-2"
                      >
                        <ProfileAvatar
                          name={member.name}
                          imageUrl={member.profile_picture}
                          size="xs"
                        />
                        <span>
                          {member.name} {member.role === "owner" ? "(Owner)" : ""}
                        </span>
                      </button>
                      {team.role === "owner" && member.id !== user?.id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removingMemberId === member.id}
                          className="rounded-full border border-red-500/50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                        >
                          {removingMemberId === member.id ? "Removing" : "Remove"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="flex h-[60vh] flex-col border border-border bg-card">
              <div className="border-b border-border px-5 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Group Chat</h3>
                    <p className="text-xs text-muted-foreground">Messages older than 24 hours are removed automatically</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => loadMessages()}>
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {loadingMessages ? (
                  <p className="text-center text-sm text-muted-foreground">Loading messages...</p>
                ) : messages.length ? (
                  messages.map((message) => {
                    const isOwnMessage = message.sender.id === user?.id
                    const bubbleClasses = isOwnMessage
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"

                    return (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        {!isOwnMessage && (
                          <button type="button" onClick={() => handleOpenProfile(message.sender.id)} className="mt-1">
                            <ProfileAvatar
                              name={message.sender.name}
                              imageUrl={message.sender.profile_picture}
                              size="sm"
                            />
                          </button>
                        )}
                        <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm shadow-sm ${bubbleClasses}`}>
                          <button
                            type="button"
                            onClick={() => handleOpenProfile(message.sender.id)}
                            className="text-left text-xs font-semibold opacity-80 hover:underline"
                          >
                            {message.sender.name}
                          </button>
                          <div>{message.content}</div>
                          <div className="mt-1 text-right text-[10px] opacity-75">{formatTimestamp(message.created_at)}</div>
                        </div>
                        {isOwnMessage && (
                          <div className="mt-1">
                            <ProfileAvatar
                              name={message.sender.name}
                              imageUrl={message.sender.profile_picture}
                              size="sm"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                )}
              </div>

              <div className="border-t border-border px-5 py-4">
                <form
                  className="flex items-end gap-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    handleSendMessage()
                  }}
                >
                  <textarea
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    placeholder="Share an update with your team..."
                    className="min-h-[60px] flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                  <Button type="submit" disabled={!messageInput.trim()}>
                    Send
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
      <UserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
    </div>
  )
}
