"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/useAuth"

interface TeamPost {
  id: number
  title: string
  description: string
  required_skills: { id: number; name: string }[]
  created_at: string
  owner: {
    id: number
    name: string
    email: string
  }
}

interface TeamRequest {
  id: number
  message?: string | null
  status: string
  created_at: string
  post_id: number
  requester: {
    id: number
    name: string
    email: string
  }
  post: TeamPost
}

interface MyRequestsPageProps {
  onBack: () => void
  onNavigateToProfile: () => void
}

export default function MyRequestsPage({ onBack, onNavigateToProfile }: MyRequestsPageProps) {
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState<"posted" | "applicants">("posted")
  const [myPosts, setMyPosts] = useState<TeamPost[]>([])
  const [requestsForMyPosts, setRequestsForMyPosts] = useState<TeamRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [posts, requests] = await Promise.all([
        api.getMyPosts(),
        api.getRequestsForMyPosts()
      ])
      setMyPosts(Array.isArray(posts) ? posts : [])
      setRequestsForMyPosts(Array.isArray(requests) ? requests : [])
    } catch (err) {
      setError('Failed to load data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptApplicant = async (requestId: number) => {
    try {
      await api.updateTeamRequestStatus(requestId, 'accepted')
      setRequestsForMyPosts(prev =>
        prev.map(req => req.id === requestId ? { ...req, status: 'accepted' } : req)
      )
    } catch (err) {
      console.error('Error accepting applicant:', err)
    }
  }

  const handleRejectApplicant = async (requestId: number) => {
    try {
      await api.updateTeamRequestStatus(requestId, 'rejected')
      setRequestsForMyPosts(prev =>
        prev.map(req => req.id === requestId ? { ...req, status: 'rejected' } : req)
      )
    } catch (err) {
      console.error('Error rejecting applicant:', err)
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

  const applicantsByRequest = myPosts.map((post) => ({
    ...post,
    applicantList: requestsForMyPosts.filter((request) => request.post_id === post.id),
  }))

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="My Requests"
        description="Manage your posted requests and view applicants"
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
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-border">
              <button
                onClick={() => setActiveTab("posted")}
                className={`px-4 py-3 font-medium transition ${
                  activeTab === "posted"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Posted Requests ({myPosts.length})
              </button>
              <button
                onClick={() => setActiveTab("applicants")}
                className={`px-4 py-3 font-medium transition ${
                  activeTab === "applicants"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Applicants ({requestsForMyPosts.length})
              </button>
            </div>

            {/* Posted Requests Tab */}
            {activeTab === "posted" && (
              <div className="space-y-4">
                {myPosts.map((post) => {
                  const applicantCount = requestsForMyPosts.filter(req => req.post_id === post.id).length
                  return (
                    <Card key={post.id} className="bg-card border-border p-6 hover:border-primary/50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-foreground">{post.title}</h3>
                            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-400 border-green-500/30">
                              active
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{post.description}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.required_skills?.map((skill) => (
                              <span
                                key={skill.id}
                                className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20"
                              >
                                {skill.name}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Posted {formatDate(post.created_at)}</span>
                            <span className="text-primary font-medium">{applicantCount} applicants</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Applicants Tab */}
            {activeTab === "applicants" && (
              <div className="space-y-6">
                {applicantsByRequest.map((post) => (
                  <div key={post.id}>
                    {/* Request Header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-foreground">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {post.applicantList.length} applicant{post.applicantList.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Applicants for this request */}
                    {post.applicantList.length > 0 ? (
                      <div className="space-y-3 mb-6 ml-4 border-l-2 border-border pl-4">
                        {post.applicantList.map((request) => (
                          <Card key={request.id} className="bg-card border-border p-4 hover:border-primary/50 transition">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-bold text-foreground">{request.requester.name}</h4>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                      request.status === "accepted"
                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                        : request.status === "rejected"
                                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                    }`}
                                  >
                                    {request.status}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {request.requester.email}
                                </p>
                                <p className="text-sm text-foreground mb-3">
                                  "{request.message || 'No message provided'}"
                                </p>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  <span>Applied {formatDate(request.created_at)}</span>
                                  <div className="flex gap-2">
                                    {request.status === "pending" && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleAcceptApplicant(request.id)}
                                          className="bg-green-500 hover:bg-green-600 text-white"
                                        >
                                          Accept
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => handleRejectApplicant(request.id)}
                                          variant="outline"
                                          className="border-border text-foreground hover:bg-secondary bg-transparent"
                                        >
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="ml-4 mb-6 pb-4 border-l-2 border-border pl-4">
                        <p className="text-sm text-muted-foreground italic">No applicants yet</p>
                      </div>
                    )}
                  </div>
                ))}

                {requestsForMyPosts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No applicants yet.</p>
                    <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Go to Dashboard
                    </Button>
                  </div>
                )}
              </div>
            )}

            {myPosts.length === 0 && activeTab === "posted" && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't posted any team requests yet.</p>
                <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Go to Dashboard
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
