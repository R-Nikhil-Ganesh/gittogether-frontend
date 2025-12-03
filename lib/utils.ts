import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProfileImageUrl(name?: string | null, imageUrl?: string | null) {
  const normalizedUrl = imageUrl?.trim()
  if (normalizedUrl) {
    return imageUrl
  }

  const seed = encodeURIComponent(name?.trim() || "profile")
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
}

export function normalizeExternalUrl(url?: string | null) {
  if (!url) {
    return null
  }

  const trimmed = url.trim()
  if (!trimmed) {
    return null
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}
