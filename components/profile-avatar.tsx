"use client"

import { cn, getProfileImageUrl } from "@/lib/utils"

interface ProfileAvatarProps {
  name?: string | null
  imageUrl?: string | null
  alt?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap: Record<NonNullable<ProfileAvatarProps["size"]>, string> = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
}

export function ProfileAvatar({
  name,
  imageUrl,
  alt,
  size = "md",
  className,
}: ProfileAvatarProps) {
  const resolvedAlt = alt || name || "User avatar"

  return (
    <img
      src={getProfileImageUrl(name, imageUrl) ?? undefined}
      alt={resolvedAlt}
      className={cn("rounded-full object-cover", sizeMap[size], className)}
      referrerPolicy="no-referrer"
    />
  )
}
