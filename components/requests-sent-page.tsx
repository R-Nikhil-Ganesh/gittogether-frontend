"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProfileHeader from "@/components/profile-header"

interface RequestsSentPageProps {
  onBack: () => void
  onNavigateToProfile: () => void
}

export default function RequestsSentPage({ onBack, onNavigateToProfile }: RequestsSentPageProps) {
  const [requestsSent] = useState([
    {
      id: 1,
      projectName: "AI Chat Application",
      posterName: "Sarah Chen",
      posterDept: "Computer Science",
      skills: ["Python", "React", "WebSocket"],
      status: "pending",
      appliedDate: "2 days ago",
      description: "Building an AI-powered chat app with real-time messaging",
    },
    {
      id: 2,
      projectName: "Mobile E-commerce App",
      posterName: "Mike Johnson",
      posterDept: "Software Engineering",
      skills: ["React Native", "Firebase", "UI/UX"],
      status: "accepted",
      appliedDate: "5 days ago",
      description: "Creating a mobile shopping platform with payment integration",
    },
    {
      id: 3,
      projectName: "Data Visualization Dashboard",
      posterName: "Alex Rodriguez",
      posterDept: "Data Science",
      skills: ["JavaScript", "D3.js", "Python"],
      status: "rejected",
      appliedDate: "1 week ago",
      description: "Analytics dashboard for real-time data insights",
    },
  ])

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
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">GitTogether</h1>
          <p className="text-sm text-muted-foreground">Team requests you've sent</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition">Sign Out</button>
          <ProfileHeader onNavigateToProfile={onNavigateToProfile} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Requests Sent</h2>
            <p className="text-muted-foreground mt-2">Track all the team requests you've applied to</p>
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            className="border-border text-foreground hover:bg-secondary bg-transparent"
          >
            Back to Dashboard
          </Button>
        </div>

        <div className="space-y-4">
          {requestsSent.map((request) => (
            <Card key={request.id} className="bg-card border-border p-6 hover:border-primary/50 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-foreground">{request.projectName}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(request.status)}`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {request.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary border border-primary/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <strong>Posted by:</strong> {request.posterName} ({request.posterDept})
                    </p>
                    <p>
                      <strong>Applied:</strong> {request.appliedDate}
                    </p>
                  </div>
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
      </div>
    </div>
  )
}
