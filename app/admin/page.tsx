"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/useAuth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const ADMIN_EMAILS = [
  "310624104028@eec.srmrmp.edu.in",
  "310624104210@eec.srmrmp.edu.in",
  "310624244058@eec.srmrmp.edu.in",
].map((email) => email.toLowerCase())

interface AdminSummary {
  users: { total: number; active: number; new_last_7_days: number }
  posts: { total: number; open: number; closed: number }
  requests: { total: number; pending: number; accepted: number; rejected: number }
  top_skills: { name: string; count: number }[]
  recent_users: any[]
  recent_posts: any[]
  recent_requests: any[]
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [tableError, setTableError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)

  const isAdmin = useMemo(() => {
    if (!user?.email) return false
    return ADMIN_EMAILS.includes(user.email.toLowerCase())
  }, [user?.email])

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!user) {
      router.replace("/")
      return
    }

    if (!isAdmin) {
      setPageError("You do not have access to the admin dashboard.")
      setLoading(false)
      return
    }

    const loadAdminData = async () => {
      try {
        setLoading(true)
        const [summaryData, usersData] = await Promise.all([
          api.getAdminSummary(),
          api.getAdminUsers(),
        ])
        setSummary(summaryData)
        setUsers(usersData)
      } catch (err) {
        console.error("Failed to load admin data", err)
        setPageError("Unable to load admin data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [isAdmin, isLoading, router, user])

  const refreshSummary = async () => {
    try {
      const summaryData = await api.getAdminSummary()
      setSummary(summaryData)
    } catch (err) {
      console.error("Failed to refresh admin summary", err)
    }
  }

  const handleToggleUser = async (userId: number, isActive: boolean) => {
    const targetUser = users.find((u) => u.id === userId)
    setInfo(null)
    setTableError(null)
    try {
      setUpdatingUserId(userId)
      const result = await api.updateAdminUserStatus(userId, !isActive)

      if (result?.deleted) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        setInfo(`${targetUser?.name ?? "User"} was removed from the platform.`)
        setTableError(null)
      } else if (result?.user) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? result.user : u)))
        setInfo(`${result.user.name} is now active.`)
        setTableError(null)
      }

      await refreshSummary()
    } catch (err) {
      console.error("Failed to update user", err)
      setTableError("Unable to update user status. Please try again.")
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full border border-border p-6 text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground">{pageError}</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">GitTogether Admin</p>
          <h1 className="text-2xl font-bold text-foreground">Control Center</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
          <Button variant="destructive" onClick={logout}>Sign out</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Users</p>
              <h2 className="text-3xl font-semibold text-foreground mt-2">{summary.users.total}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Active: {summary.users.active} · New (7d): {summary.users.new_last_7_days}
              </p>
            </Card>
            <Card className="border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Posts</p>
              <h2 className="text-3xl font-semibold text-foreground mt-2">{summary.posts.total}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Open: {summary.posts.open} · Closed: {summary.posts.closed}
              </p>
            </Card>
            <Card className="border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Requests</p>
              <h2 className="text-3xl font-semibold text-foreground mt-2">{summary.requests.total}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Pending: {summary.requests.pending} · Accepted: {summary.requests.accepted} · Rejected: {summary.requests.rejected}
              </p>
            </Card>
          </div>
        )}

        {summary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Top Skills</h3>
                <span className="text-xs text-muted-foreground">Most requested</span>
              </div>
              <div className="space-y-3">
                {summary.top_skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skill data available yet.</p>
                )}
                {summary.top_skills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.count} posts</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
                <span className="text-xs text-muted-foreground">Latest posts & requests</span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Latest Posts</p>
                  <ul className="space-y-2">
                    {summary.recent_posts.length === 0 && (
                      <li className="text-sm text-muted-foreground">No posts yet.</li>
                    )}
                    {summary.recent_posts.map((post) => (
                      <li key={post.id} className="text-sm text-foreground">
                        {post.title} <span className="text-muted-foreground">· {post.owner?.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Latest Requests</p>
                  <ul className="space-y-2">
                    {summary.recent_requests.length === 0 && (
                      <li className="text-sm text-muted-foreground">No requests yet.</li>
                    )}
                    {summary.recent_requests.map((req) => (
                      <li key={req.id} className="text-sm text-foreground">
                        {req.requester?.name || "Unknown"} · {req.status}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Card className="border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">User Management</h3>
              <p className="text-sm text-muted-foreground">Activate or deactivate accounts</p>
            </div>
          </div>
          {info && (
            <div className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              {info}
            </div>
          )}
          {tableError && (
            <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {tableError}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/60 last:border-b-0">
                    <td className="py-3 pr-4 text-foreground">{u.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          u.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <Button
                        variant={u.is_active ? "destructive" : "outline"}
                        size="sm"
                        disabled={updatingUserId === u.id}
                        onClick={() => handleToggleUser(u.id, u.is_active)}
                      >
                        {updatingUserId === u.id ? "Saving..." : u.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}
