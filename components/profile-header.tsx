"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/useAuth"

interface ProfileHeaderProps {
  onNavigateToProfile: () => void
  onSignOut: () => void
}

export default function ProfileHeader({ onNavigateToProfile, onSignOut }: ProfileHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleProfileClick = () => {
    onNavigateToProfile()
    setIsDropdownOpen(false)
  }

  const handleSignOutClick = () => {
    onSignOut()
    setIsDropdownOpen(false)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        {/* Profile Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-semibold hover:bg-primary/30 transition">
            {user?.name ? user.name.charAt(0).toUpperCase() : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>}
          </div>
          <div className="text-left min-w-[120px]">
            <p className="text-sm font-medium text-foreground leading-none">{user?.name ?? 'Loading user'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50"
        >
          <div className="p-4 border-b border-border space-y-1">
            <p className="text-sm font-medium text-foreground">{user?.name ?? 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ''}</p>
          </div>

          <div className="p-2 space-y-1">
            <Button
              onClick={handleProfileClick}
              variant="ghost"
              className="w-full justify-start text-foreground hover:bg-secondary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A3.001 3.001 0 017 12h10a3 3 0 011.879 5.304M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              View Profile
            </Button>
            <Button
              onClick={handleSignOutClick}
              variant="ghost"
              className="w-full justify-start text-red-400 hover:bg-red-500/10"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
