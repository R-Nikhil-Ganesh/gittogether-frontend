"use client"

import { useState, useMemo, useEffect } from "react"
import PageHeader from "@/components/page-header"
import { ProfileAvatar } from "@/components/profile-avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import UserProfileModal from "@/components/user-profile-modal"
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
    profile_picture?: string | null
  }
}

interface FindTeamViewProps {
  onBack: () => void
  onNavigateToProfile: () => void
}

export default function FindTeamView({ onBack, onNavigateToProfile }: FindTeamViewProps) {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string | null>(null)
  const [appliedIds, setAppliedIds] = useState<number[]>([])
  const [teamPosts, setTeamPosts] = useState<TeamPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileUserId, setProfileUserId] = useState<number | null>(null)

  useEffect(() => {
    fetchTeamPosts()
    fetchAppliedPosts()
  }, [])

  const fetchTeamPosts = async () => {
    try {
      setLoading(true)
      const posts = await api.getTeamPosts()
      setTeamPosts(Array.isArray(posts) ? posts : [])
    } catch (err) {
      setError('Failed to load team posts')
      console.error('Error fetching team posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppliedPosts = async () => {
    try {
      const requests = await api.getMyRequests()
      if (Array.isArray(requests)) {
        setAppliedIds(requests.map((req: any) => req.post_id))
      }
    } catch (err) {
      console.error('Error fetching applied posts:', err)
    }
  }

  const allSkills = Array.from(
    new Set(teamPosts.flatMap((post) => post.required_skills?.map((skill) => skill.name) ?? []))
  ).sort()

  const filteredRequests = useMemo(() => {
    return teamPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.owner.name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSkill =
        !selectedSkillFilter || post.required_skills?.some((skill) => skill.name === selectedSkillFilter)

      return matchesSearch && matchesSkill
    })
  }, [teamPosts, searchQuery, selectedSkillFilter])

  const handleApply = async (postId: number) => {
    try {
      if (appliedIds.includes(postId)) {
        // Cancel application - we'd need a cancel endpoint
        return
      }
      
      await api.createTeamRequest(postId, 'I would like to join this team!')
      setAppliedIds((prev) => [...prev, postId])
    } catch (err) {
      setError('Failed to send team request')
      console.error('Error creating team request:', err)
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

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Find a Team"
        description="Browse and apply to projects that match your skills"
        onBack={onBack}
        onNavigateToProfile={onNavigateToProfile}
        onSignOut={logout}
      />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div>
            <Input
              type="text"
              placeholder="Search by project name, description, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedSkillFilter(null)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                selectedSkillFilter === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary border border-border text-foreground hover:border-muted-foreground"
              }`}
            >
              All Skills
            </button>
            {allSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkillFilter(selectedSkillFilter === skill ? null : skill)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                  selectedSkillFilter === skill
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary border border-border text-foreground hover:border-muted-foreground"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="text-center py-4 text-red-500">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading team posts...</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredRequests.length} of {teamPosts.length} team requests
            </p>
            {filteredRequests.map((post) => (
              <Card
                key={post.id}
                className="bg-card border border-border p-6 hover:border-primary/50 transition-colors"
              >
                <div className="space-y-4">
                  {/* Title and Meta */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{post.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <ProfileAvatar
                          name={post.owner.name}
                          imageUrl={post.owner.profile_picture}
                          size="xs"
                        />
                        <button
                          type="button"
                          className="text-left underline-offset-2 hover:underline"
                          onClick={() => setProfileUserId(post.owner.id)}
                        >
                          Posted by {post.owner.name}
                        </button>
                      </div>
                      <span>•</span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-foreground leading-relaxed">{post.description}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {post.required_skills?.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary border border-border text-foreground"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>

                  {/* Apply Button */}
                  <div className="pt-2">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        onClick={() => handleApply(post.id)}
                        disabled={post.owner.id === user?.id}
                        className={`flex-1 ${
                          post.owner.id === user?.id
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : appliedIds.includes(post.id)
                            ? "bg-secondary text-foreground hover:bg-secondary/80"
                            : "bg-primary hover:bg-primary/90 text-primary-foreground"
                        }`}
                      >
                        {post.owner.id === user?.id 
                          ? "Your Post" 
                          : appliedIds.includes(post.id) 
                          ? "✓ Application Sent" 
                          : "Apply Now"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-border text-foreground hover:bg-secondary"
                        onClick={() => setProfileUserId(post.owner.id)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="w-12 h-12 mx-auto text-muted-foreground mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-foreground font-medium">No team requests found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
      <UserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
    </div>
  )
}
