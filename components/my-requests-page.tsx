"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/page-header"

interface Applicant {
  id: number
  name: string
  department: string
  skills: string[]
  appliedForRequestId: number
  appliedDate: string
  status: "pending" | "accepted" | "rejected"
  year: string
}

interface PostedRequest {
  id: number
  projectName: string
  description: string
  skills: string[]
  status: "active" | "closed"
  postedDate: string
  applicantCount: number
}

interface MyRequestsPageProps {
  onBack: () => void
  onNavigateToProfile: () => void
  onSignOut: () => void
}

export default function MyRequestsPage({ onBack, onNavigateToProfile, onSignOut }: MyRequestsPageProps) {
  const [activeTab, setActiveTab] = useState<"posted" | "applicants">("posted")
  const [postedRequests, setPostedRequests] = useState<PostedRequest[]>([
    {
      id: 1,
      projectName: "Machine Learning Pipeline",
      description: "Building a scalable ML pipeline for image classification",
      skills: ["Python", "TensorFlow", "Docker"],
      status: "active",
      postedDate: "3 days ago",
      applicantCount: 2,
    },
    {
      id: 2,
      projectName: "Mobile App Backend",
      description: "RESTful API for mobile application with authentication",
      skills: ["Node.js", "Express", "MongoDB"],
      status: "active",
      postedDate: "1 week ago",
      applicantCount: 1,
    },
    {
      id: 3,
      projectName: "Frontend Redesign",
      description: "Modernizing the UI/UX of our web application",
      skills: ["React", "Tailwind CSS", "UI/UX Design"],
      status: "closed",
      postedDate: "2 weeks ago",
      applicantCount: 1,
    },
  ])

  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: 1,
      name: "Emma Wilson",
      department: "Computer Science",
      skills: ["Python", "JavaScript", "React"],
      appliedForRequestId: 1,
      appliedDate: "1 day ago",
      status: "pending",
      year: "3rd Year",
    },
    {
      id: 2,
      name: "David Kumar",
      department: "Information Technology",
      skills: ["Python", "Machine Learning", "Data Analysis"],
      appliedForRequestId: 1,
      appliedDate: "4 days ago",
      status: "pending",
      year: "2nd Year",
    },
    {
      id: 3,
      name: "James Park",
      department: "Software Engineering",
      skills: ["Node.js", "Express", "PostgreSQL"],
      appliedForRequestId: 2,
      appliedDate: "2 days ago",
      status: "accepted",
      year: "2nd Year",
    },
    {
      id: 4,
      name: "Lisa Chen",
      department: "Computer Science",
      skills: ["React", "Figma", "UX Design"],
      appliedForRequestId: 3,
      appliedDate: "3 days ago",
      status: "accepted",
      year: "4th Year",
    },
  ])

  const handleToggleStatus = (requestId: number) => {
    setPostedRequests(
      postedRequests.map((req) =>
        req.id === requestId ? { ...req, status: req.status === "active" ? "closed" : "active" } : req,
      ),
    )
  }

  const handleAcceptApplicant = (applicantId: number) => {
    setApplicants(applicants.map((app) => (app.id === applicantId ? { ...app, status: "accepted" } : app)))
  }

  const handleRejectApplicant = (applicantId: number) => {
    setApplicants(applicants.map((app) => (app.id === applicantId ? { ...app, status: "rejected" } : app)))
  }

  const applicantsByRequest = postedRequests.map((request) => ({
    ...request,
    applicantList: applicants.filter((applicant) => applicant.appliedForRequestId === request.id),
  }))

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="My Requests"
        description="Manage your posted requests and view applicants"
        onBack={onBack}
        onNavigateToProfile={onNavigateToProfile}
        onSignOut={onSignOut}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
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
            Posted Requests ({postedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("applicants")}
            className={`px-4 py-3 font-medium transition ${
              activeTab === "applicants"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Applicants ({applicants.length})
          </button>
        </div>

        {/* Posted Requests Tab */}
        {activeTab === "posted" && (
          <div className="space-y-4">
            {postedRequests.map((request) => (
              <Card key={request.id} className="bg-card border-border p-6 hover:border-primary/50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{request.projectName}</h3>
                      <button
                        onClick={() => handleToggleStatus(request.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition ${
                          request.status === "active"
                            ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30"
                        }`}
                      >
                        {request.status}
                      </button>
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
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Posted {request.postedDate}</span>
                      <span className="text-primary font-medium">{request.applicantCount} applicants</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Applicants Tab */}
        {activeTab === "applicants" && (
          <div className="space-y-6">
            {applicantsByRequest.map((request) => (
              <div key={request.id}>
                {/* Request Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-foreground">{request.projectName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {request.applicantList.length} applicant{request.applicantList.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Applicants for this request */}
                {request.applicantList.length > 0 ? (
                  <div className="space-y-3 mb-6 ml-4 border-l-2 border-border pl-4">
                    {request.applicantList.map((applicant) => (
                      <Card key={applicant.id} className="bg-card border-border p-4 hover:border-primary/50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-foreground">{applicant.name}</h4>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                  applicant.status === "accepted"
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : applicant.status === "rejected"
                                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                }`}
                              >
                                {applicant.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {applicant.year} • {applicant.department}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {applicant.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-1 text-xs rounded-md bg-accent/10 text-accent border border-accent/20"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Applied {applicant.appliedDate}</span>
                              <div className="flex gap-2">
                                {applicant.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAcceptApplicant(applicant.id)}
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleRejectApplicant(applicant.id)}
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

            {applicants.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No applicants yet.</p>
                <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
        )}

        {(activeTab === "posted" ? postedRequests : applicants).length === 0 && activeTab === "posted" && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven't posted any team requests yet.</p>
            <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
