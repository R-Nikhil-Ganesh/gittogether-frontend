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
    <div className="border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-2 sm:mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{title}</h1>
        <p className="text-sm text-muted-foreground hidden sm:block">{description}</p>
      </div>
      <ProfileHeader onNavigateToProfile={onNavigateToProfile} onSignOut={onSignOut} />
    </div>
  )
}
