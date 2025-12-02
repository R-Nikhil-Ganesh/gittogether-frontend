"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/useAuth"

interface ProfilePageProps {
  onBack: () => void
  onNavigateToProfile: () => void
}

interface ProfileForm {
  name: string
  email: string
  profile_picture: string
  bio: string
  department: string
  year: string
  linkedin: string
  github: string
}

const emptyProfile: ProfileForm = {
  name: "",
  email: "",
  profile_picture: "",
  bio: "",
  department: "",
  year: "",
  linkedin: "",
  github: "",
}

const mapProfileToForm = (profile: any): ProfileForm => ({
  name: profile?.name ?? "",
  email: profile?.email ?? "",
  profile_picture: profile?.profile_picture ?? "",
  bio: profile?.bio ?? "",
  department: profile?.department ?? "",
  year: profile?.year ?? "",
  linkedin: profile?.linkedin ?? "",
  github: profile?.github ?? "",
})

export default function ProfilePage({ onBack, onNavigateToProfile }: ProfilePageProps) {
  const { user, logout, setUser, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileData, setProfileData] = useState<ProfileForm>(emptyProfile)
  const [editData, setEditData] = useState<ProfileForm>(emptyProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const profile = user ?? await api.getProfile()
        if (!user && profile) {
          setUser(profile)
        }
        const mapped = mapProfileToForm(profile)
        setProfileData(mapped)
        setEditData(mapped)
        setError(null)
      } catch (err) {
        console.error('Failed to load profile:', err)
        setError('Failed to load profile information. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
    // We only want to run this on mount; user updates are handled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user) {
      const mapped = mapProfileToForm(user)
      setProfileData(mapped)
      if (!isEditing) {
        setEditData(mapped)
      }
    }
  }, [user, isEditing])

  const handleInputChange = (field: keyof ProfileForm, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditData((prev) => ({ ...prev, profile_picture: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      let profilePictureUrl = editData.profile_picture

      if (imageFile) {
        const uploadResponse = await api.uploadProfileImage(imageFile)
        profilePictureUrl = uploadResponse?.profile_picture ?? profilePictureUrl
      }

      const payload = {
        name: editData.name,
        bio: editData.bio || null,
        department: editData.department || null,
        year: editData.year || null,
        linkedin: editData.linkedin || null,
        github: editData.github || null,
      }

      const updatedProfile = await api.updateProfile(payload)
      const mapped = mapProfileToForm({ ...updatedProfile, profile_picture: profilePictureUrl })

      setProfileData(mapped)
      setEditData(mapped)
      setIsEditing(false)
      setImageFile(null)
      await refreshUser()
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData(profileData)
    setIsEditing(false)
    setImageFile(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="My Profile"
        description="Manage your personal information and social links"
        onBack={onBack}
        onNavigateToProfile={onNavigateToProfile}
        onSignOut={logout}
      />

      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card className="bg-card border border-border">
          <div className="p-8 space-y-8">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading profile...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-foreground">Profile Details</h2>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>

                <div className="flex flex-col items-center gap-4">
                  {isEditing ? (
                    <div className="flex flex-col items-center gap-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="relative group w-24 h-24 rounded-full border-2 border-primary overflow-hidden hover:border-primary/70 transition"
                      >
                        <img
                          src={editData.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editData.name || 'profile'}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground">Click to upload image</p>
                    </div>
                  ) : (
                    <img
                      src={profileData.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.name || 'profile'}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-2 border-primary"
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <p className="text-lg text-foreground">{profileData.name}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <p className="text-foreground">{profileData.email}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Department</label>
                    {isEditing ? (
                      <Input
                        value={editData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        placeholder="e.g., Computer Science"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    ) : (
                      <p className="text-foreground">{profileData.department || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Year</label>
                    {isEditing ? (
                      <Input
                        value={editData.year}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                        placeholder="e.g., 3rd Year"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    ) : (
                      <p className="text-foreground">{profileData.year || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={editData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full rounded-md bg-input border border-border px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Tell others about your interests and experience"
                      />
                    ) : (
                      <p className="text-foreground leading-relaxed">
                        {profileData.bio || 'No bio provided yet.'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Social Links</h3>

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
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    ) : profileData.linkedin ? (
                      <a
                        href={profileData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 break-all"
                      >
                        {profileData.linkedin}
                      </a>
                    ) : (
                      <p className="text-muted-foreground italic">Not provided</p>
                    )}
                  </div>

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
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        placeholder="https://github.com/yourprofile"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    ) : profileData.github ? (
                      <a
                        href={profileData.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 break-all"
                      >
                        {profileData.github}
                      </a>
                    ) : (
                      <p className="text-muted-foreground italic">Not provided</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      disabled={saving}
                      variant="outline"
                      className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent disabled:opacity-50"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
