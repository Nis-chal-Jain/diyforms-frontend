"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/contexts/auth-provider"
import { LandingPage } from "@/components/landing/landing-page"
import { ResponsesView } from "@/components/responses/responses-view"
import { Skeleton } from "@/components/ui/skeleton"

export default function ResponsesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-32 w-full max-w-3xl" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LandingPage />
  }

  return <ResponsesView />
}
