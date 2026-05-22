"use client"

import { useState } from "react"

import { ContainerTextFlip } from "@/components/ui/container-text-flip"
import { ChartPieLabel } from "@/components/categories"
import { RadioGroupFieldset } from "@/components/radio"
import { TableDemo } from "@/components/tableex"
import {
  LearnersBarChart,
  SkillsRadarChart,
  ProjectsDonutChart,
} from "@/components/morecharts"
import { AuthDialogs } from "@/components/auth/auth-dialogs"
import { Button } from "@/components/ui/button"

export function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null)

  return (
    <>
      <AuthDialogs mode={authMode} onModeChange={setAuthMode} />

      <section className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
        <div className="absolute inset-0 z-0 grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 lg:p-6">
          <div className="h-[193px] rounded-2xl bg-muted/60 p-2 sm:h-[220px] lg:h-[300px]">
            <div className="h-full w-full">
              <RadioGroupFieldset />
            </div>
          </div>

          <div className="h-[180px] rounded-2xl bg-muted/60 p-2 sm:h-[220px] lg:h-[260px]">
            <ChartPieLabel />
          </div>

          <div className="hidden h-[180px] rounded-2xl bg-muted/60 p-2 sm:block sm:h-[220px] lg:h-[260px]">
            <LearnersBarChart />
          </div>

          <div className="hidden h-[180px] rounded-2xl bg-muted/60 p-2 lg:block lg:h-[260px]">
            <SkillsRadarChart />
          </div>

          <div className="hidden h-[180px] rounded-2xl bg-muted/60 p-2 sm:block sm:h-[220px] lg:h-[260px]">
            <TableDemo />
          </div>

          <div className="hidden h-[180px] rounded-2xl bg-muted/60 p-2 lg:block lg:h-[260px]">
            <ProjectsDonutChart />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent,rgba(255,255,255,0.55))] dark:bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.35))]" />

        <div className="pointer-events-none relative z-20 flex min-h-screen items-center justify-center px-4 text-center">
          <div className="pointer-events-auto max-w-3xl rounded-3xl border border-border/60 bg-background/50 p-5 backdrop-blur-xl sm:p-8">
            <h1 className="text-2xl font-bold leading-tight sm:text-4xl md:text-6xl">
              Build minimal forms
              <br />
              that give you{" "}
              <span className="inline-block">
                <ContainerTextFlip words={["insights", "analytics", "data"]} />
              </span>
            </h1>

            <p className="mt-4 text-xs text-muted-foreground sm:text-sm md:text-base">
              Hover over charts in the background to interact with live analytics.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => setAuthMode("login")}
              >
                Login
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setAuthMode("signup")}
              >
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
