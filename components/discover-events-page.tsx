"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"

import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/useAuth"

interface EventOwner {
  id: number
  name: string
  email: string
  profile_picture?: string | null
}

interface EventItem {
  id: number
  title: string
  description: string
  link: string
  image_url?: string | null
  created_at: string
  owner: EventOwner
}

interface DiscoverEventsPageProps {
  onBack: () => void
  onNavigateToProfile: () => void
}

export default function DiscoverEventsPage({ onBack, onNavigateToProfile }: DiscoverEventsPageProps) {
  const { logout, user } = useAuth()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formBusy, setFormBusy] = useState(false)
  const [title, setTitle] = useState("")
  const [link, setLink] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [description, setDescription] = useState("")
  const [info, setInfo] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [imageUploading, setImageUploading] = useState(false)

  const visibleEvents = useMemo(() => {
    if (!search.trim()) {
      return events
    }
    const query = search.toLowerCase()
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
    )
  }, [events, search])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getEvents()
      setEvents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to load events", err)
      setError("Unable to fetch events right now. Try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleCreateEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim() || !description.trim() || !link.trim()) {
      setError("Please fill in all event details.")
      return
    }
    setFormBusy(true)
    setError(null)
    setInfo(null)
    try {
      await api.createEvent({
        title: title.trim(),
        description: description.trim(),
        link: link.trim(),
        image_url: imageUrl.trim() ? imageUrl.trim() : undefined,
      })
      setInfo("Event published!")
      setTitle("")
      setLink("")
      setImageUrl("")
      setDescription("")
      await loadEvents()
    } catch (err) {
      console.error("Failed to publish event", err)
      setError(err instanceof Error ? err.message : "Unable to publish event")
    } finally {
      setFormBusy(false)
    }
  }

  const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) {
      return
    }

    if (file.size > 7 * 1024 * 1024) {
      setError("Image must be smaller than 7MB.")
      return
    }

    setImageUploading(true)
    setError(null)
    setInfo(null)
    try {
      const response = await api.uploadEventImage(file)
      if (response?.url) {
        setImageUrl(response.url)
        setInfo("Image uploaded successfully.")
      }
    } catch (err) {
      console.error("Failed to upload image", err)
      setError(err instanceof Error ? err.message : "Unable to upload image")
    } finally {
      setImageUploading(false)
    }
  }

  const handleDelete = async (eventId: number) => {
    if (!window.confirm("Remove this event?")) {
      return
    }
    try {
      await api.deleteEvent(eventId)
      await loadEvents()
    } catch (err) {
      console.error("Failed to delete event", err)
      setError("Could not delete event. Please try again.")
    }
  }

  const formatRelative = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString(undefined, { hour12: true, day: "numeric", month: "short" })
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Discover Events"
        description="Spot campus happenings and drop your own links for others to join."
        onBack={onBack}
        onNavigateToProfile={onNavigateToProfile}
        onSignOut={logout}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {info && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {info}
          </div>
        )}
        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <Card className="border border-border bg-card p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Share an event</h2>
            <p className="text-sm text-muted-foreground">Add quick details so classmates can RSVP or join remotely.</p>
          </div>
          <form onSubmit={handleCreateEvent} className="space-y-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event name"
            />
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Event link (Google Form, site, etc.)"
              type="url"
            />
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image link (auto-filled after upload, optional)"
              type="url"
            />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm text-muted-foreground" htmlFor="event-image-upload">
                  Upload poster (optional)
                </label>
                <input
                  id="event-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="text-xs"
                  disabled={imageUploading}
                />
              </div>
              {imageUploading && <p className="text-xs text-muted-foreground">Uploading image...</p>}
              {!imageUploading && imageUrl && (
                <div className="overflow-hidden rounded-md border border-border/70">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Event preview" className="w-full max-h-56 object-cover" loading="lazy" />
                </div>
              )}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this event about?"
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              rows={4}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Keep it short and helpful. You can delete it anytime.</span>
              <Button type="submit" disabled={formBusy || imageUploading}>
                {formBusy ? "Posting..." : "Post event"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="border border-border bg-card p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Upcoming & ongoing</h2>
              <p className="text-sm text-muted-foreground">Browse every shared link in one place.</p>
            </div>
            <div className="flex gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="bg-input border-border"
              />
              <Button variant="outline" onClick={loadEvents}>
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading events...</p>
          ) : visibleEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nothing yet. Share the first event!
            </div>
          ) : (
            <div className="space-y-4">
              {visibleEvents.map((event) => (
                <Card key={event.id} className="border border-border/80 bg-background/50 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                      <p className="text-xs text-muted-foreground">Posted by {event.owner.name} · {formatRelative(event.created_at)}</p>
                    </div>
                    {event.owner.id === user?.id && (
                      <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}>
                        Delete
                      </Button>
                    )}
                  </div>
                  {event.image_url && (
                    <div className="overflow-hidden rounded-lg border border-border/70">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.image_url}
                        alt={`${event.title} poster`}
                        className="w-full max-h-72 object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <p className="text-sm text-foreground whitespace-pre-line">{event.description}</p>
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Go to event ↗
                  </a>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
