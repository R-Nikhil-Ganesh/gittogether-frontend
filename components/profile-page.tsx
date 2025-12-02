"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ProfilePageProps {
  onBack: () => void
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const [profileData, setProfileData] = useState({
    name: "John Developer",
    year: "3rd Year",
    department: "Computer Science",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    linkedin: "https://linkedin.com/in/johndeveloper",
    leetcode: "https://leetcode.com/johndeveloper",
    github: "https://github.com/johndeveloper",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(profileData)

  const handleInputChange = (field: string, value: string) => {
    setEditData({ ...editData, [field]: value })
  }

  const handleSave = () => {
    setProfileData(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(profileData)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">GitTogether</h1>
          <p className="text-sm text-muted-foreground">Build amazing projects with your team</p>
        </div>
        <Button
          onClick={onBack}
          variant="outline"
          className="border-border text-foreground hover:bg-secondary bg-transparent"
        >
          Back to Dashboard
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card className="bg-card border border-border">
          <div className="p-8 space-y-8">
            {/* Title */}
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-foreground">My Profile</h2>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Profile Image Section */}
            <div className="flex flex-col items-center gap-4">
              <img
                src={profileData.image || "/placeholder.svg"}
                alt="Profile"
                className="w-24 h-24 rounded-full border-2 border-primary"
              />
              {isEditing && (
                <div className="w-full space-y-2">
                  <label className="text-sm font-medium text-foreground">Profile Image URL</label>
                  <Input
                    type="text"
                    value={editData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                ) : (
                  <p className="text-lg text-foreground">{profileData.name}</p>
                )}
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Year</label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                ) : (
                  <p className="text-foreground">{profileData.year}</p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Department</label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                ) : (
                  <p className="text-foreground">{profileData.department}</p>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Social Links</h3>

              {/* LinkedIn */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  LinkedIn
                </label>
                {isEditing ? (
                  <Input
                    type="url"
                    value={editData.linkedin}
                    onChange={(e) => handleInputChange("linkedin", e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                ) : (
                  <a
                    href={profileData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent/80 break-all"
                  >
                    {profileData.linkedin}
                  </a>
                )}
              </div>

              {/* LeetCode */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.102 17.93h2.747v-5.92h2.623V9.99h-2.623V8.35c0-.918.435-1.429 1.529-1.429h1.139V5.002c-.197-.035-1.368-.166-2.604-.166-2.598 0-4.381 1.603-4.381 4.547v1.996h-2.771v2.02h2.771v5.92z" />
                  </svg>
                  LeetCode
                </label>
                {isEditing ? (
                  <Input
                    type="url"
                    value={editData.leetcode}
                    onChange={(e) => handleInputChange("leetcode", e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                ) : (
                  <a
                    href={profileData.leetcode}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent/80 break-all"
                  >
                    {profileData.leetcode}
                  </a>
                )}
              </div>

              {/* GitHub */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </label>
                {isEditing ? (
                  <Input
                    type="url"
                    value={editData.github}
                    onChange={(e) => handleInputChange("github", e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                ) : (
                  <a
                    href={profileData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent/80 break-all"
                  >
                    {profileData.github}
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
