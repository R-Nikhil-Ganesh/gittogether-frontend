"use client"

import { useEffect, useState, type ReactNode } from "react"
import { CalendarDays, Github, Linkedin, Mail, GraduationCap } from "lucide-react"
import { ProfileAvatar } from "@/components/profile-avatar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { normalizeExternalUrl } from "@/lib/utils"

interface SkillSummary {
  id: number
  name: string
  description?: string | null
}

interface UserProfileData {
  id: number
  name: string
  email?: string | null
  bio?: string | null
  profile_picture?: string | null
  department?: string | null
  year?: string | null
  linkedin?: string | null
  github?: string | null
  skills?: SkillSummary[]
  created_at?: string
}

interface UserProfileModalProps {
  userId: number | null
  onClose: () => void
}

export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      return
    }

    let isMounted = true
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await api.getUserPublicProfile(userId)
        if (isMounted) {
          setProfile(data as UserProfileData)
        }
      } catch (err) {
        console.error("Failed to load user profile:", err)
        if (isMounted) {
          setError("Unable to load user profile")
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProfile()
    return () => {
      isMounted = false
    }
  }, [userId])

  if (!userId) {
    return null
  }

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="w-full max-w-3xl">
        <Card className="relative max-h-[90vh] overflow-y-auto border border-border bg-card shadow-2xl">
          <div className="sticky top-4 flex justify-end px-6 pt-6">
            <button
              type="button"
              aria-label="Close profile"
              className="rounded-full p-2 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div className="px-8 pb-10">
            {loading ? (
              <p className="py-12 text-center text-muted-foreground">Loading profile...</p>
            ) : error ? (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-200">
                {error}
              </div>
            ) : profile ? (
              <div className="space-y-8">
                <div className="flex flex-col items-center gap-4 text-center">
                  <ProfileAvatar
                    name={profile.name}
                    imageUrl={profile.profile_picture}
                    size="xl"
                    className="border-4 border-primary/70 shadow-lg"
                  />
                  <div>
                    <h2 className="text-3xl font-semibold text-foreground">{profile.name}</h2>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                      {profile.department && (
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          <span>{profile.department}</span>
                        </div>
                      )}
                      {profile.year && (
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          <span>{profile.year}</span>
                        </div>
                      )}
                      {formatJoinDate(profile.created_at) && (
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          <span>Joined {formatJoinDate(profile.created_at)}</span>
                        </div>
                      )}
                    </div>
                    {profile.email && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">About</h3>
                  <p className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
                    {profile.bio || "This user hasn’t added a bio yet."}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Skills & Interests</h3>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="rounded-full border border-border bg-secondary/30 px-4 py-1 text-xs font-medium uppercase tracking-wide text-foreground"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills listed yet.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Connect</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <ContactCard
                      icon={<Linkedin className="h-4 w-4" />}
                      label="LinkedIn"
                      href={profile.linkedin}
                    />
                    <ContactCard
                      icon={<Github className="h-4 w-4" />}
                      label="GitHub"
                      href={profile.github}
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-border pt-4">
                  <Button onClick={onClose} variant="outline" className="border-border">
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <p className="py-12 text-center text-muted-foreground">Profile not found.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

interface ContactCardProps {
  icon: ReactNode
  label: string
  href?: string | null
}

function ContactCard({ icon, label, href }: ContactCardProps) {
  const safeHref = normalizeExternalUrl(href)

  if (!safeHref) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/10 p-4 text-sm text-muted-foreground">
        <span className="rounded-full bg-muted/40 p-2 text-muted-foreground">{icon}</span>
        <div>
          <p className="font-medium text-foreground/80">{label}</p>
          <p className="text-xs text-muted-foreground">Not shared yet</p>
        </div>
      </div>
    )
  }

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-4 text-sm text-foreground transition hover:border-primary/60 hover:bg-secondary/40"
    >
      <span className="rounded-full bg-primary/20 p-2 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{safeHref}</p>
      </div>
    </a>
  )
}
