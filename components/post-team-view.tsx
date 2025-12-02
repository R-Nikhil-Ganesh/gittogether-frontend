"use client"

import type React from "react"

import { useState, useEffect } from "react"
import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/useAuth"

interface PostTeamViewProps {
  onBack: () => void
  onNavigateToProfile: () => void
}

interface Skill {
  id: number
  name: string
  category?: string | null
}

const QUICK_SKILL_OPTIONS = ["Python", "Frontend", "Backend", "Mobile", "UI/UX", "DevOps"] as const

export default function PostTeamView({ onBack, onNavigateToProfile }: PostTeamViewProps) {
  const { logout } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [maxMembers, setMaxMembers] = useState(5)
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [skillsError, setSkillsError] = useState<string | null>(null)
  const [quickAddInfo, setQuickAddInfo] = useState<string | null>(null)

  useEffect(() => {
    const loadSkills = async () => {
      try {
        setSkillsLoading(true)
        const data = await api.getSkills()
        setSkills(data)
      } catch (err) {
        console.error('Failed to load skills:', err)
        setSkillsError('Unable to load skills. Please try again later.')
      } finally {
        setSkillsLoading(false)
      }
    }

    loadSkills()
  }, [])

  const toggleSkill = (skillId: number) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    )
    setQuickAddInfo(null)
  }

  const handleQuickSkill = (skillName: string) => {
    const match = skills.find((skill) => skill.name.toLowerCase() === skillName.toLowerCase())
    if (!match) {
      setQuickAddInfo(`"${skillName}" is not available yet. Add it in the admin panel to use it here.`)
      return
    }
    if (selectedSkillIds.includes(match.id)) {
      setSelectedSkillIds((prev) => prev.filter((id) => id !== match.id))
      setQuickAddInfo(`${skillName} removed from required skills`)
    } else {
      setSelectedSkillIds((prev) => [...prev, match.id])
      setQuickAddInfo(`${skillName} added to required skills`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || selectedSkillIds.length === 0) {
      setError('Please fill in all fields and select at least one skill')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await api.createTeamPost({
        title,
        description,
        max_members: maxMembers,
        required_skill_ids: selectedSkillIds
      })
      
      // Reset form
      setTitle("")
      setDescription("")
      setMaxMembers(5)
      setSelectedSkillIds([])
      
      // Show success message and navigate back
      alert("Team request posted successfully!")
      onBack()
    } catch (err) {
      setError('Failed to post team request. Please try again.')
      console.error('Error creating team post:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Post a Team Request"
        description="Share your project and find the right team members"
        onBack={onBack}
        onNavigateToProfile={onNavigateToProfile}
        onSignOut={logout}
      />

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card className="bg-card border border-border p-8">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Project Title</label>
              <Input
                placeholder="e.g., AI Collaboration Platform"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Give your project a clear, catchy name</p>
            </div>

            {/* Team Size */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Max Team Members</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value) || 1)}
                className="bg-input border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">Include yourself when choosing the maximum team size.</p>
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Project Description</label>
              <textarea
                placeholder="Describe your project, what you're building, and what you're looking for in team members..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full rounded-md bg-input border border-border px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">Be specific about your vision and goals</p>
            </div>

            {/* Skills Required */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Required Skills</label>
                <p className="text-xs text-muted-foreground mb-4">Select all skills needed for this project</p>
                {skillsError && (
                  <p className="text-xs text-destructive">{skillsError}</p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Quick add popular skills</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SKILL_OPTIONS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleQuickSkill(name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        selectedSkillIds.some((id) =>
                          skills.find((skill) => skill.id === id)?.name.toLowerCase() === name.toLowerCase()
                        )
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary border-border text-foreground hover:border-muted-foreground"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                {quickAddInfo && (
                  <p className="text-xs text-muted-foreground">{quickAddInfo}</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {skillsLoading ? (
                  <p className="text-sm text-muted-foreground col-span-full">Loading skills...</p>
                ) : (
                  skills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        selectedSkillIds.includes(skill.id)
                          ? "bg-primary text-primary-foreground border border-primary"
                          : "bg-secondary border border-border text-foreground hover:border-muted-foreground"
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))
                )}
              </div>
              {selectedSkillIds.length === 0 && (
                <p className="text-xs text-destructive">Please select at least one skill</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={loading}
                className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={
                  loading ||
                  !title ||
                  !description ||
                  selectedSkillIds.length === 0 ||
                  maxMembers < 1
                }
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post Request"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
