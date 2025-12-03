"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import LandingPage from "@/components/landing-page"
import { useAuth } from "@/lib/useAuth"

export default function IndexPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard")
    }
  }, [isLoading, user, router])

  if (isLoading) return null

  return <LandingPage />
}
