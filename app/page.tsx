"use client"

import { useState } from "react"
import AuthPage from "@/components/auth-page"
import DashboardPage from "@/components/dashboard-page"
import ProfilePage from "@/components/profile-page"
import RequestsSentPage from "@/components/requests-sent-page"
import MyRequestsPage from "@/components/my-requests-page"

type View = "auth" | "dashboard" | "profile" | "requests-sent" | "my-requests"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState<View>("auth")

  if (!isAuthenticated) {
    return <AuthPage onAuthenticate={() => setIsAuthenticated(true)} />
  }

  if (currentView === "profile") {
    return <ProfilePage onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "requests-sent") {
    return (
      <RequestsSentPage
        onBack={() => setCurrentView("dashboard")}
        onNavigateToProfile={() => setCurrentView("profile")}
      />
    )
  }

  if (currentView === "my-requests") {
    return (
      <MyRequestsPage
        onBack={() => setCurrentView("dashboard")}
        onNavigateToProfile={() => setCurrentView("profile")}
      />
    )
  }

  return (
    <DashboardPage
      onNavigateToProfile={() => setCurrentView("profile")}
      onNavigateToRequestsSent={() => setCurrentView("requests-sent")}
      onNavigateToMyRequests={() => setCurrentView("my-requests")}
    />
  )
}
