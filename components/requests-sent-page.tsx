"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import { ProfileAvatar } from "@/components/profile-avatar"
import UserProfileModal from "@/components/user-profile-modal"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/useAuth"

interface TeamRequest {
  id: number
  message?: string | null
  status: string
  created_at: string
  post: {
    id: number
    title: string
    description: string
    required_skills: { id: number; name: string }[]
    owner: {
      id: number
      name: string
      email: string
      profile_picture?: string | null
    }
  }
}

interface RequestsSentPageProps {
  onBack: () => void
  onNavigateToProfile: () => void
}

export default function RequestsSentPage({ onBack, onNavigateToProfile }: RequestsSentPageProps) {
  const { logout } = useAuth()
  const [requestsSent, setRequestsSent] = useState<TeamRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileUserId, setProfileUserId] = useState<number | null>(null)

  useEffect(() => {
    fetchMyRequests()
  }, [])

  const fetchMyRequests = async () => {
    try {
      setLoading(true)
      const requests = await api.getMyRequests()
      setRequestsSent(Array.isArray(requests) ? requests : [])
    } catch (err) {
      setError('Failed to load your requests')
      console.error('Error fetching requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Requests Sent"
        description="Track all the team requests you've applied to"
        onBack={onBack}
        onNavigateToProfile={onNavigateToProfile}
        onSignOut={logout}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your requests...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {requestsSent.map((request) => (
                <Card key={request.id} className="bg-card border-border p-6 hover:border-primary/50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{request.post.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(request.status)}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{request.post.description}</p>
                      
                      {/* My message */}
                      <div className="mb-3 p-3 bg-muted/50 rounded-md border-l-4 border-primary">
                        <p className="text-sm text-foreground">
                          <strong>Your message:</strong> "{request.message || 'No message provided'}"
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {request.post.required_skills?.map((skill) => (
                          <span
                            key={skill.id}
                            className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="flex flex-wrap items-center gap-2">
                          <strong>Posted by:</strong>
                          <button
                            type="button"
                            className="flex items-center gap-2 text-left underline-offset-2 hover:underline"
                            onClick={() => setProfileUserId(request.post.owner.id)}
                          >
                            <ProfileAvatar
                              name={request.post.owner.name}
                              imageUrl={request.post.owner.profile_picture}
                              size="xs"
                            />
                            {request.post.owner.name}
                          </button>
                        </p>
                        <p>
                          <strong>Applied:</strong> {formatDate(request.created_at)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4 border-border text-foreground hover:bg-secondary"
                        onClick={() => setProfileUserId(request.post.owner.id)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {requestsSent.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't sent any team requests yet.</p>
                <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Browse Team Requests
                </Button>
              </div>
            )}
          </>
        )}

        <UserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
      </div>
    </div>
  )
}
