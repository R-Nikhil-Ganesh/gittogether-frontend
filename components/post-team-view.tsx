"use client"

import type React from "react"

import { useState } from "react"
import ProfileHeader from "@/components/profile-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface PostTeamViewProps {
  onBack: () => void
  onNavigateToProfile: () => void
}

const AVAILABLE_SKILLS = [
  "Python",
  "JavaScript",
  "React",
  "Vue",
  "Angular",
  "Node.js",
  "TypeScript",
  "Java",
  "C++",
  "Go",
  "Rust",
  "PHP",
  "UI Design",
  "UX Design",
  "Product Design",
  "Graphic Design",
  "DevOps",
  "Cloud",
  "Database",
  "API Design",
  "Mobile",
]

export default function PostTeamView({ onBack, onNavigateToProfile }: PostTeamViewProps) {
  const [eventName, setEventName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (eventName && description && selectedSkills.length > 0) {
      alert("Team request posted successfully!")
      onBack()
    }
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
          <h1 className="text-2xl font-bold text-foreground">Post a Team Request</h1>
          <p className="text-sm text-muted-foreground">Share your project and find the right team members</p>
        </div>
        <ProfileHeader onNavigateToProfile={onNavigateToProfile} />
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card className="bg-card border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Event Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Event Name</label>
              <Input
                placeholder="e.g., AI-Powered Chat Application"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Give your project a clear, catchy name</p>
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
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {AVAILABLE_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      selectedSkills.includes(skill)
                        ? "bg-primary text-primary-foreground border border-primary"
                        : "bg-secondary border border-border text-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {selectedSkills.length === 0 && (
                <p className="text-xs text-destructive">Please select at least one skill</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Post Request
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
