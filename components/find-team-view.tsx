"use client"

import { useState, useMemo } from "react"
import ProfileHeader from "@/components/profile-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface FindTeamViewProps {
  onBack: () => void
  onNavigateToProfile: () => void
}

// Mock data for team requests
const MOCK_TEAM_REQUESTS = [
  {
    id: 1,
    name: "AI-Powered Chat Application",
    description: "Building a next-gen chat app with AI suggestions and real-time collaboration",
    skills: ["Python", "React", "Node.js", "TypeScript"],
    postedBy: "Alex Chen",
    postedDate: "2 days ago",
    applicants: 3,
  },
  {
    id: 2,
    name: "E-Commerce Platform Redesign",
    description: "Complete redesign of our e-commerce platform focusing on UX and performance",
    skills: ["React", "UI Design", "JavaScript", "Cloud"],
    postedBy: "Sarah Johnson",
    postedDate: "1 day ago",
    applicants: 5,
  },
  {
    id: 3,
    name: "Mobile App MVP Launch",
    description: "Launching MVP for a fitness tracking mobile application",
    skills: ["React", "Mobile", "API Design", "TypeScript"],
    postedBy: "Mike Rodriguez",
    postedDate: "3 days ago",
    applicants: 2,
  },
  {
    id: 4,
    name: "DevOps Infrastructure Setup",
    description: "Setting up CI/CD pipeline and cloud infrastructure for startup",
    skills: ["DevOps", "Cloud", "Go", "Database"],
    postedBy: "Emma Wilson",
    postedDate: "4 days ago",
    applicants: 4,
  },
  {
    id: 5,
    name: "Game Development - 3D Platformer",
    description: "Creating an indie 3D platformer game with Unity",
    skills: ["C++", "Game Development", "Graphic Design"],
    postedBy: "James Park",
    postedDate: "5 days ago",
    applicants: 6,
  },
  {
    id: 6,
    name: "Data Analytics Dashboard",
    description: "Building interactive analytics dashboard for financial data visualization",
    skills: ["Python", "React", "Database", "Data Visualization"],
    postedBy: "Lisa Chen",
    postedDate: "1 day ago",
    applicants: 2,
  },
]

export default function FindTeamView({ onBack, onNavigateToProfile }: FindTeamViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string | null>(null)
  const [appliedIds, setAppliedIds] = useState<number[]>([])

  const allSkills = Array.from(new Set(MOCK_TEAM_REQUESTS.flatMap((req) => req.skills))).sort()

  const filteredRequests = useMemo(() => {
    return MOCK_TEAM_REQUESTS.filter((request) => {
      const matchesSearch =
        request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.postedBy.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSkill = !selectedSkillFilter || request.skills.includes(selectedSkillFilter)

      return matchesSearch && matchesSkill
    })
  }, [searchQuery, selectedSkillFilter])

  const handleApply = (id: number) => {
    setAppliedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-foreground">Find a Team</h1>
          <p className="text-sm text-muted-foreground">Browse and apply to projects that match your skills</p>
        </div>
        <ProfileHeader onNavigateToProfile={onNavigateToProfile} />
      </div>

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
        {filteredRequests.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredRequests.length} of {MOCK_TEAM_REQUESTS.length} team requests
            </p>
            {filteredRequests.map((request) => (
              <Card
                key={request.id}
                className="bg-card border border-border p-6 hover:border-primary/50 transition-colors"
              >
                <div className="space-y-4">
                  {/* Title and Meta */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{request.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Posted by {request.postedBy}</span>
                      <span>•</span>
                      <span>{request.postedDate}</span>
                      <span>•</span>
                      <span>{request.applicants} applicants</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-foreground leading-relaxed">{request.description}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {request.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary border border-border text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Apply Button */}
                  <div className="pt-2">
                    <Button
                      onClick={() => handleApply(request.id)}
                      className={`w-full ${
                        appliedIds.includes(request.id)
                          ? "bg-secondary text-foreground hover:bg-secondary/80"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      }`}
                    >
                      {appliedIds.includes(request.id) ? "✓ Application Sent" : "Apply Now"}
                    </Button>
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
    </div>
  )
}
