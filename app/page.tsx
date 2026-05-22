"use client"

import { useAuth } from "@/contexts/auth-provider"
import { LandingPage } from "@/components/landing/landing-page"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="mt-4 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="col-span-full h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <DashboardView />
  }

  return <LandingPage />
}
