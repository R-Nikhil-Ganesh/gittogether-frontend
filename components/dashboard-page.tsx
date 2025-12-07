"use client"

import { useState, useEffect } from "react"
import ProfileHeader from "@/components/profile-header"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/useAuth"

interface DashboardPageProps {
  onNavigateToProfile: () => void
  onNavigateToRequestsSent: () => void
  onNavigateToMyRequests: () => void
  onNavigateToFindTeam: () => void
  onNavigateToPostTeam: () => void
  onNavigateToTeams: () => void
  onNavigateToFriends: () => void
  onNavigateToEvents: () => void
  onNavigateToAdmin?: () => void
}

export default function DashboardPage({
  onNavigateToProfile,
  onNavigateToRequestsSent,
  onNavigateToMyRequests,
  onNavigateToFindTeam,
  onNavigateToPostTeam,
  onNavigateToTeams,
  onNavigateToFriends,
  onNavigateToEvents,
  onNavigateToAdmin,
}: DashboardPageProps) {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { logout, user } = useAuth()

  const isAdmin = Boolean(user?.email && [
    "310624104028@eec.srmrmp.edu.in",
    "310624104210@eec.srmrmp.edu.in",
    "310624244058@eec.srmrmp.edu.in",
  ].includes(user.email.toLowerCase()))

  const handleSignOut = () => {
    logout()
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await api.getDashboardSummary()
        setDashboardData(data)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">GitTogether</h1>
        <ProfileHeader onNavigateToProfile={onNavigateToProfile} onSignOut={handleSignOut} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
          <div className="w-full max-w-4xl space-y-12">
            <div className="text-center space-y-2 px-4">
              <h2 className="text-2xl sm:text-4xl font-bold text-foreground">Find teammates. Join teams. Discover hackathons.</h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Your campus hub for forming project teams and finding collaborators.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-3 sm:gap-4 mb-8">
              <button
                onClick={onNavigateToRequestsSent}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition"
              >
                <span className="hidden sm:inline">Requests Sent</span>
                <span className="sm:hidden">Requests</span>
                {dashboardData?.pending_sent_requests ? ` (${dashboardData.pending_sent_requests})` : ""}
              </button>
              <button
                onClick={onNavigateToMyRequests}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition"
              >
                <span className="hidden sm:inline">My Posts</span>
                <span className="sm:hidden">Posts</span>
                {dashboardData?.pending_received_requests ? ` (${dashboardData.pending_received_requests})` : ""}
              </button>
              <button
                onClick={onNavigateToTeams}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition"
              >
                <span className="hidden sm:inline">My Teams & Chat</span>
                <span className="sm:hidden">Teams</span>
              </button>
              {isAdmin && onNavigateToAdmin && (
                <button
                  onClick={onNavigateToAdmin}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition"
                >
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </button>
              )}
            </div>

            {/* Two/Three Path Options */}
            <div className="grid md:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto px-4">
              {/* Post a Team Request */}
              <button
                onClick={onNavigateToPostTeam}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 sm:p-8 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary border border-primary/30 group-hover:bg-primary/20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition">
                      Create a Team for an Event
                    </h3>
                  </div>
                </div>
              </button>

              {/* Find a Team */}
              <button
                onClick={onNavigateToFindTeam}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 sm:p-8 transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/20 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 text-accent border border-accent/30 group-hover:bg-accent/20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-accent transition">Join an Existing Team</h3>
                  </div>
                </div>
              </button>

              {/* Friends & Messages card placed beside Find a Team */}
              <button
                onClick={onNavigateToFriends}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 sm:p-8 transition-all duration-300 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-200/10 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/6 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500/20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M7 20h10M12 12a4 4 0 100-8 4 4 0 000 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-emerald-400 transition">Friends & Messages</h3>
                  </div>
                </div>
              </button>

              {/* Discover Events card placed beside Friends & Messages */}
              <button
                onClick={onNavigateToEvents}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 sm:p-8 transition-all duration-300 hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/20 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/30 group-hover:bg-sky-500/20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 19h14M10 15h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-sky-300 transition">Explore Hackathons</h3>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
