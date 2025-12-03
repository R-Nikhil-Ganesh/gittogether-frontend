"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { api } from "@/lib/api"

interface Skill {
  id: number
  name: string
  category?: string | null
}

interface TeamDetails {
  id: number
  title: string
  description: string
  max_members: number
  required_skills: Skill[]
}

interface TeamEditorModalProps {
  teamId: number | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function TeamEditorModal({ teamId, open, onClose, onSuccess }: TeamEditorModalProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loadingSkills, setLoadingSkills] = useState(true)
  const [loadingTeam, setLoadingTeam] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    max_members: 5,
    required_skill_ids: [] as number[],
  })

  useEffect(() => {
    const loadSkills = async () => {
      try {
        setLoadingSkills(true)
        const data = await api.getSkills()
        setSkills(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Failed to load skills", err)
      } finally {
        setLoadingSkills(false)
      }
    }
    loadSkills()
  }, [])

  useEffect(() => {
    if (!open || !teamId) {
      return
    }

    const loadTeam = async () => {
      try {
        setLoadingTeam(true)
        setError(null)
        const data = await api.getTeamPost(teamId)
        if (data) {
          setForm({
            title: data.title,
            description: data.description,
            max_members: data.max_members,
            required_skill_ids: data.required_skills?.map((skill: Skill) => skill.id) ?? [],
          })
        }
      } catch (err) {
        console.error("Failed to load team details", err)
        setError("Unable to load team details. Please try again.")
      } finally {
        setLoadingTeam(false)
      }
    }

    loadTeam()
  }, [open, teamId])

  const toggleSkill = (skillId: number) => {
    setForm((prev) => ({
      ...prev,
      required_skill_ids: prev.required_skill_ids.includes(skillId)
        ? prev.required_skill_ids.filter((id) => id !== skillId)
        : [...prev.required_skill_ids, skillId],
    }))
  }

  const handleSave = async () => {
    if (!teamId) {
      return
    }

    if (!form.title || !form.description || form.required_skill_ids.length === 0) {
      setError("Please complete all fields and select at least one skill")
      return
    }

    try {
      setSaving(true)
      setError(null)
      await api.updateTeamPost(teamId, {
        title: form.title,
        description: form.description,
        max_members: form.max_members,
        required_skill_ids: form.required_skill_ids,
      })
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Failed to update team", err)
      setError("Unable to update team. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!teamId) {
      return
    }

    if (!window.confirm("Delete this team? This action cannot be undone.")) {
      return
    }

    try {
      setDeleting(true)
      setError(null)
      await api.deleteTeamPost(teamId)
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Failed to delete team", err)
      setError("Unable to delete team. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  const skillNameMap = useMemo(() => {
    const map = new Map<number, string>()
    skills.forEach((skill) => map.set(skill.id, skill.name))
    return map
  }, [skills])

  const activeSkillNames = form.required_skill_ids
    .map((id) => skillNameMap.get(id))
    .filter(Boolean)
    .join(", ")

  if (!open || !teamId) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="w-full max-w-2xl">
        <Card className="max-h-[85vh] overflow-y-auto border-2 border-primary/40 bg-card p-8 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Edit Team Details</h2>
              <p className="mt-1 text-sm text-muted-foreground">Update your request information or remove it entirely.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-transparent px-3 py-1 text-xl text-muted-foreground hover:border-border"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {loadingTeam ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading team details...
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Project Title</label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="e.g., AI Collaboration Platform"
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Max Team Members</label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={form.max_members}
                  onChange={(event) => setForm((prev) => ({ ...prev, max_members: Number(event.target.value) || 1 }))}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Project Description</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-md bg-input border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                  Required Skills
                  <span className="text-xs text-muted-foreground">{activeSkillNames || "No skills selected"}</span>
                </label>
                {loadingSkills ? (
                  <p className="text-sm text-muted-foreground">Loading skills...</p>
                ) : (
                  <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-2">
                    {skills.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                          form.required_skill_ids.includes(skill.id)
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-border bg-secondary text-foreground hover:border-muted-foreground"
                        }`}
                      >
                        {skill.name}
                      </button>
                    ))}
                  </div>
                )}
                {form.required_skill_ids.length === 0 && (
                  <p className="text-xs text-destructive">Select at least one skill</p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={saving || deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white hover:bg-red-500 disabled:opacity-60"
              disabled={saving || deleting || loadingTeam}
            >
              {deleting ? "Deleting..." : "Delete Team"}
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={saving || deleting || loadingTeam}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
