"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { api } from "@/lib/api"

export default function AuthPage() {
  const handleGoogleAuth = async () => {
    try {
      console.log("Attempting to get Google auth URL...")
      const response = await api.getGoogleAuthUrl()
      console.log("Google auth response:", response)

      if (response.authorization_url) {
        console.log("Redirecting to:", response.authorization_url)
        window.location.href = response.authorization_url
      } else {
        throw new Error("No authorization URL received")
      }
    } catch (error: any) {
      console.error("Authentication failed:", error)
      alert(`Authentication failed: ${error.message || "Please try again."}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md bg-card border border-border">
        <div className="p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground">GitTogether</h1>
            <p className="text-sm text-muted-foreground">
              Find your perfect development team
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Sign in with your Google account to get started
            </p>

            <Button
              onClick={handleGoogleAuth}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.91 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Sign in with Google
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
