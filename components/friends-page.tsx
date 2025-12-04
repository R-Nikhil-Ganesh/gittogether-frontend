"use client"

import { KeyboardEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from "react"

import PageHeader from "@/components/page-header"
import { ProfileAvatar } from "@/components/profile-avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/useAuth"
import { normalizeExternalUrl } from "@/lib/utils"

interface FriendSummary {
  id: number
  name: string
  email: string
  profile_picture?: string | null
  bio?: string | null
}

interface FriendListResponse {
  friends: FriendSummary[]
}

type RelationshipStatus = "self" | "friend" | "pending_incoming" | "pending_outgoing" | "none"

interface FriendSearchResult {
  user: FriendSummary
  relationship_status: RelationshipStatus
}

interface PublicSkill {
  id: number
  name: string
  description?: string | null
  category?: string | null
  created_at?: string
}

interface PublicProfile {
  id: number
  name: string
  email: string
  bio?: string | null
  profile_picture?: string | null
  department?: string | null
  year?: string | null
  roll_number?: string | null
  linkedin?: string | null
  github?: string | null
  leetcode?: string | null
  skills?: PublicSkill[]
}

interface FriendRequest {
  id: number
  status: string
  created_at: string
  message?: string | null
  requester: FriendSummary
  target: FriendSummary
}

interface FriendRequestsPayload {
  incoming: FriendRequest[]
  outgoing: FriendRequest[]
}

interface FriendMessage {
  id: number
  content: string
  created_at: string
  expires_at: string
  sender: FriendSummary
  receiver: FriendSummary
}

interface FriendsPageProps {
  onBack: () => void
  onNavigateToProfile: () => void
}

export default function FriendsPage({ onBack, onNavigateToProfile }: FriendsPageProps) {
  const { logout, user } = useAuth()
  const [friends, setFriends] = useState<FriendSummary[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<FriendSearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [requests, setRequests] = useState<FriendRequestsPayload>({ incoming: [], outgoing: [] })
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null)
  const [messages, setMessages] = useState<FriendMessage[]>([])
  const [messageDraft, setMessageDraft] = useState("")
  const [messageLoading, setMessageLoading] = useState(false)
  const [info, setInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [profilePreview, setProfilePreview] = useState<FriendSearchResult | null>(null)
  const [profilePreviewData, setProfilePreviewData] = useState<PublicProfile | null>(null)
  const [profilePreviewLoading, setProfilePreviewLoading] = useState(false)
  const [profilePreviewError, setProfilePreviewError] = useState<string | null>(null)

  const selectedFriend = useMemo(() => friends.find((f) => f.id === selectedFriendId) ?? null, [friends, selectedFriendId])
  const previewProfile = useMemo(() => {
    if (!profilePreview) {
      return null
    }

    const baseUser = profilePreview.user

    return {
      id: profilePreviewData?.id ?? baseUser.id,
      name: profilePreviewData?.name ?? baseUser.name,
      email: profilePreviewData?.email ?? baseUser.email,
      bio: profilePreviewData?.bio ?? baseUser.bio ?? "",
      profile_picture: profilePreviewData?.profile_picture ?? baseUser.profile_picture,
      department: profilePreviewData?.department ?? null,
      year: profilePreviewData?.year ?? null,
      roll_number: profilePreviewData?.roll_number ?? null,
      linkedin: profilePreviewData?.linkedin ?? null,
      github: profilePreviewData?.github ?? null,
      leetcode: profilePreviewData?.leetcode ?? null,
      skills: profilePreviewData?.skills ?? [],
    }
  }, [profilePreview, profilePreviewData])

  const loadFriends = useCallback(async () => {
    try {
      const response: FriendListResponse = await api.getFriends()
      setFriends(response.friends ?? [])
    } catch (err) {
      console.error("Failed to load friends", err)
      setError("Unable to fetch friends. Please try again later.")
    }
  }, [])

  const loadRequests = useCallback(async () => {
    try {
      setRequestsLoading(true)
      const response: FriendRequestsPayload = await api.getFriendRequests()
      setRequests(response)
    } catch (err) {
      console.error("Failed to load friend requests", err)
      setError("Unable to load friend requests. Please try again.")
    } finally {
      setRequestsLoading(false)
    }
  }, [])

  const loadMessages = useCallback(async (friendId: number) => {
    try {
      setChatError(null)
      const response: FriendMessage[] = await api.getFriendMessages(friendId)
      setMessages(response ?? [])
    } catch (err) {
      console.error("Failed to load friend messages", err)
      setChatError("Unable to load messages. Please try again.")
    }
  }, [])

  useEffect(() => {
    loadFriends()
    loadRequests()
  }, [loadFriends, loadRequests])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const handler = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const response: FriendSearchResult[] = await api.searchFriends(searchQuery.trim())
        setSearchResults(response ?? [])
      } catch (err) {
        console.error("Failed to search friends", err)
        setError("Unable to search users right now.")
      } finally {
        setSearchLoading(false)
      }
    }, 400)

    return () => clearTimeout(handler)
  }, [searchQuery])

  useEffect(() => {
    if (!selectedFriendId) {
      setMessages([])
      return
    }

    loadMessages(selectedFriendId)
    const interval = setInterval(() => loadMessages(selectedFriendId), 15000)
    return () => clearInterval(interval)
  }, [loadMessages, selectedFriendId])

  useEffect(() => {
    if (!profilePreview) {
      setProfilePreviewData(null)
      setProfilePreviewError(null)
      setProfilePreviewLoading(false)
      return
    }

    let isCancelled = false

    const fetchProfile = async () => {
      try {
        setProfilePreviewLoading(true)
        setProfilePreviewError(null)
        const profile = await api.getUserPublicProfile(profilePreview.user.id)
        if (!isCancelled) {
          setProfilePreviewData(profile)
        }
      } catch (err) {
        console.error("Failed to load public profile", err)
        if (!isCancelled) {
          setProfilePreviewError("Unable to load the full profile right now.")
        }
      } finally {
        if (!isCancelled) {
          setProfilePreviewLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      isCancelled = true
    }
  }, [profilePreview])

  const handleSendFriendRequest = async (targetId: number) => {
    try {
      setInfo(null)
      setError(null)
      await api.sendFriendRequest({ target_user_id: targetId })
      setInfo("Friend request sent")
      setSearchResults((previous) =>
        previous.map((result) =>
          result.user.id === targetId ? { ...result, relationship_status: "pending_outgoing" } : result
        )
      )
      setProfilePreview((previous) =>
        previous && previous.user.id === targetId ? { ...previous, relationship_status: "pending_outgoing" } : previous
      )
      await Promise.all([loadRequests(), loadFriends()])
    } catch (err) {
      console.error("Failed to send friend request", err)
      setError(err instanceof Error ? err.message : "Unable to send friend request")
    }
  }

  const openProfilePreview = (result: FriendSearchResult) => {
    setProfilePreview(result)
  }

  const closeProfilePreview = () => {
    setProfilePreview(null)
    setProfilePreviewData(null)
    setProfilePreviewError(null)
  }

  useEffect(() => {
    if (!profilePreview) {
      return
    }

    const handleEsc = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProfilePreview()
      }
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [profilePreview])

  const handleAcceptRequest = async (requestId: number) => {
    try {
      setInfo(null)
      await api.acceptFriendRequest(requestId)
      setInfo("Friend request accepted")
      await Promise.all([loadRequests(), loadFriends()])
    } catch (err) {
      console.error("Failed to accept friend request", err)
      setError(err instanceof Error ? err.message : "Unable to process request")
    }
  }

  const handleRejectRequest = async (requestId: number) => {
    try {
      setInfo(null)
      await api.rejectFriendRequest(requestId)
      setInfo("Friend request rejected")
      await loadRequests()
    } catch (err) {
      console.error("Failed to reject friend request", err)
      setError(err instanceof Error ? err.message : "Unable to process request")
    }
  }

  const handleCancelRequest = async (requestId: number) => {
    try {
      setInfo(null)
      await api.cancelFriendRequest(requestId)
      setInfo("Friend request cancelled")
      await loadRequests()
    } catch (err) {
      console.error("Failed to cancel friend request", err)
      setError(err instanceof Error ? err.message : "Unable to cancel request")
    }
  }

  const handleSelectFriend = (friendId: number) => {
    setSelectedFriendId(friendId)
  }

  const handleSendMessage = async () => {
    if (!selectedFriendId || !messageDraft.trim()) {
      return
    }

    try {
      setMessageLoading(true)
      await api.sendFriendMessage(selectedFriendId, messageDraft.trim())
      setMessageDraft("")
      await loadMessages(selectedFriendId)
    } catch (err) {
      console.error("Failed to send message", err)
      setChatError(err instanceof Error ? err.message : "Unable to send message")
    } finally {
      setMessageLoading(false)
    }
  }

  const handleResultKeyDown = (event: KeyboardEvent<HTMLDivElement>, result: FriendSearchResult) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openProfilePreview(result)
    }
  }

  const relationshipLabel = (status: RelationshipStatus) => {
    switch (status) {
      case "self":
        return "You"
      case "friend":
        return "Friends"
      case "pending_incoming":
        return "Respond pending"
      case "pending_outgoing":
        return "Requested"
      default:
        return "Add"
    }
  }

  const canAddFriend = (status: RelationshipStatus) => status === "none"

  const relationshipDescription = (status: RelationshipStatus) => {
    switch (status) {
      case "friend":
        return "You're already connected. Use the chat panel to keep conversations fresh."
      case "pending_outgoing":
        return "Request sent. They'll need to accept before chats unlock."
      case "pending_incoming":
        return "They reached out to you. Head to the requests panel to accept or decline."
      case "self":
        return "This is your profile view."
      default:
        return "Send a request to open a 24-hour chat window and coordinate quickly."
    }
  }

  const renderSocialLink = (url?: string | null) => {
    const normalized = normalizeExternalUrl(url)
    if (!normalized) {
      return <p className="text-sm text-muted-foreground italic">Not provided</p>
    }

    return (
      <a
        href={normalized}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-accent hover:text-accent/80 break-all"
      >
        {normalized}
      </a>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Friends & Messages"
        description="Find classmates, exchange quick messages, and stay in sync"
        onBack={onBack}
        onNavigateToProfile={onNavigateToProfile}
        onSignOut={logout}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {info && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {info}
          </div>
        )}
        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <Card className="border border-border bg-card p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Search classmates</h2>
              <p className="text-sm text-muted-foreground">Send a request to start a 24-hour chat whenever needed.</p>
            </div>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or email..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {searchLoading && <p className="text-sm text-muted-foreground">Searching users...</p>}
          {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground">No users matched your search.</p>
          )}
          {!searchLoading && searchResults.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {searchResults.map((result) => (
                <div
                  key={result.user.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openProfilePreview(result)}
                  onKeyDown={(event) => handleResultKeyDown(event, result)}
                  className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-3 bg-background/40 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">{result.user.name}</p>
                    <p className="text-xs text-muted-foreground break-all">{result.user.email}</p>
                    {result.user.bio && <p className="text-xs text-muted-foreground">{result.user.bio}</p>}
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">Click to preview profile</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant={canAddFriend(result.relationship_status) ? "default" : "outline"}
                      disabled={!canAddFriend(result.relationship_status)}
                      onClick={(event: MouseEvent<HTMLButtonElement>) => {
                        event.stopPropagation()
                        handleSendFriendRequest(result.user.id)
                      }}
                    >
                      {relationshipLabel(result.relationship_status)}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation()
                        openProfilePreview(result)
                      }}
                    >
                      View profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border border-border bg-card p-6 space-y-4 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Friends</h2>
              <Button variant="outline" size="sm" onClick={loadFriends}>
                Refresh
              </Button>
            </div>
            {friends.length === 0 && <p className="text-sm text-muted-foreground">No friends yet. Send a request to get started.</p>}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleSelectFriend(friend.id)}
                  className={`w-full text-left rounded-md border px-3 py-2 transition ${
                    selectedFriendId === friend.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background/50 hover:border-primary/40"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{friend.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{friend.email}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="border border-border bg-card p-6 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Friend Requests</h2>
                <p className="text-xs text-muted-foreground">Respond quickly so chats can stay live for the next 24 hours.</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadRequests} disabled={requestsLoading}>
                {requestsLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Incoming</h3>
                {requests.incoming.length === 0 && <p className="text-xs text-muted-foreground">Nothing waiting.</p>}
                {requests.incoming.map((request) => (
                  <div key={request.id} className="rounded-md border border-border p-3 space-y-2 bg-background/40">
                    <p className="text-sm font-medium text-foreground">{request.requester.name}</p>
                    {request.message && <p className="text-xs text-muted-foreground">“{request.message}”</p>}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                        Accept
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleRejectRequest(request.id)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Outgoing</h3>
                {requests.outgoing.length === 0 && <p className="text-xs text-muted-foreground">No pending requests.</p>}
                {requests.outgoing.map((request) => (
                  <div key={request.id} className="rounded-md border border-border p-3 space-y-2 bg-background/40">
                    <p className="text-sm font-medium text-foreground">{request.target.name}</p>
                    {request.message && <p className="text-xs text-muted-foreground">“{request.message}”</p>}
                    <Button variant="outline" size="sm" onClick={() => handleCancelRequest(request.id)}>
                      Cancel
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Card className="border border-border bg-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Chat</h2>
              <p className="text-xs text-muted-foreground">Messages auto-delete after 24 hours to keep things lightweight.</p>
            </div>
            {selectedFriend && (
              <div className="text-sm text-muted-foreground">
                Chatting with <span className="font-medium text-foreground">{selectedFriend.name}</span>
              </div>
            )}
          </div>
          {!selectedFriend && <p className="text-sm text-muted-foreground">Select a friend to start chatting.</p>}
          {selectedFriend && (
            <div className="space-y-4">
              {chatError && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {chatError}
                </div>
              )}
              <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages in the last 24 hours.</p>}
                {messages.map((message) => {
                  const isMine = message.sender.id === user?.id
                  return (
                    <div
                      key={message.id}
                      className={`max-w-md rounded-md px-3 py-2 text-sm ${
                        isMine
                          ? "ml-auto bg-primary/10 text-primary-foreground"
                          : "mr-auto bg-secondary text-foreground"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-[10px] uppercase tracking-wide mt-2 text-muted-foreground">
                        Expires {new Date(message.expires_at).toLocaleTimeString()} · Sent {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  )
                })}
              </div>
              <div className="space-y-2">
                <textarea
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  placeholder="Type a quick update..."
                  rows={3}
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Chats vanish after one day. Keep important notes elsewhere.</span>
                  <Button onClick={handleSendMessage} disabled={messageLoading || !messageDraft.trim()}>
                    {messageLoading ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>

      {profilePreview && previewProfile && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-preview-title"
          onClick={closeProfilePreview}
        >
          <div className="relative mx-auto w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <Card className="border border-border bg-card/95 p-0 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-3 border-b border-border/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">General Profile</p>
                  <h2 id="profile-preview-title" className="text-3xl font-semibold text-foreground">
                    {previewProfile.name}
                  </h2>
                  <p className="text-sm text-muted-foreground break-all">{previewProfile.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={closeProfilePreview} aria-label="Close profile preview">
                  ✕
                </Button>
              </div>

              {profilePreviewError && (
                <div className="mx-6 mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {profilePreviewError}
                </div>
              )}

              <div className="grid gap-8 px-6 py-6 lg:grid-cols-[320px_1fr]">
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <ProfileAvatar
                      name={previewProfile.name}
                      imageUrl={previewProfile.profile_picture ?? undefined}
                      size="xl"
                      className="border-4 border-primary/50"
                    />
                    <div className="w-full space-y-4 rounded-lg border border-border bg-background/70 px-4 py-4 text-left">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Department</p>
                        <p className="text-sm text-foreground">{previewProfile.department ?? "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Batch</p>
                        <p className="text-sm text-foreground">{previewProfile.year ?? "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                        <p className="text-sm text-foreground break-all">{previewProfile.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-lg border border-border bg-background/70 px-4 py-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Connection Status</p>
                    <p className="text-sm text-foreground">{relationshipLabel(profilePreview.relationship_status)}</p>
                    <p className="text-sm text-muted-foreground">{relationshipDescription(profilePreview.relationship_status)}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      disabled={!canAddFriend(profilePreview.relationship_status)}
                      onClick={() => handleSendFriendRequest(profilePreview.user.id)}
                    >
                      {relationshipLabel(profilePreview.relationship_status)}
                    </Button>
                    <Button variant="outline" onClick={closeProfilePreview}>
                      Close preview
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {profilePreviewLoading && (
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Loading full profile details...</p>
                  )}

                  <section className="space-y-2 rounded-lg border border-border bg-background/70 px-5 py-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Bio</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {previewProfile.bio || "No bio provided yet."}
                    </p>
                  </section>

                  <section className="space-y-3 rounded-lg border border-border bg-background/70 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Skills & Focus</h3>
                      <span className="text-xs text-muted-foreground">Last synced from their profile</span>
                    </div>
                    {previewProfile.skills && previewProfile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {previewProfile.skills.map((skill) => (
                          <span key={skill.id} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Skills not listed yet.</p>
                    )}
                  </section>

                  <section className="space-y-4 rounded-lg border border-border bg-background/70 px-5 py-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Social Links</h3>
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">LinkedIn</p>
                      {renderSocialLink(previewProfile.linkedin)}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">GitHub</p>
                      {renderSocialLink(previewProfile.github)}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">LeetCode</p>
                      {renderSocialLink(previewProfile.leetcode)}
                    </div>
                  </section>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
