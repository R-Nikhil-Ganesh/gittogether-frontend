"use client"

import ProfileHeader from "@/components/profile-header"

interface PageHeaderProps {
  title: string
  description: string
  onBack: () => void
  onNavigateToProfile: () => void
  onSignOut: () => void
}

export default function PageHeader({ title, description, onBack, onNavigateToProfile, onSignOut }: PageHeaderProps) {
  return (
    <div className="border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ProfileHeader onNavigateToProfile={onNavigateToProfile} onSignOut={onSignOut} />
    </div>
  )
}
