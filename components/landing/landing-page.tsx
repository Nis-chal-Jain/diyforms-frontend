"use client"

import { useState } from "react"
import Image from "next/image"
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
import heroImage from "./hero.png"

const DEMO_VIDEO_URL = "https://youtu.be/GoYlrgRueJA"
const DEMO_VIDEO_ID = "GoYlrgRueJA"

export function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null)

  return (
    <>
      <AuthDialogs mode={authMode} onModeChange={setAuthMode} />

      <div className="min-h-screen bg-background text-foreground">
        <section className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
          <Image
            src={heroImage}
            alt="A dandelion growing from stone against rolling hills and sky"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />

          <div
            className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent,rgba(255,255,255,0.55))] dark:bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.35))]"
            aria-hidden
          />

          <div className="relative z-20 flex min-h-screen flex-col">
            <header className="flex shrink-0 items-center justify-end gap-2 p-4 sm:gap-3 sm:p-6">
              <Button
                size="lg"
                className="min-w-[5.5rem] border border-white/80 bg-white text-neutral-600 shadow-sm hover:bg-white/90"
                onClick={() => setAuthMode("login")}
              >
                Login
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="min-w-[5.5rem] border-white/60 bg-black/25 text-white shadow-md backdrop-blur-sm hover:bg-black/40 hover:text-white"
                onClick={() => setAuthMode("signup")}
              >
                Sign up
              </Button>
            </header>

            <div className="pointer-events-none flex flex-1 items-center justify-center px-4 pb-10 text-center sm:pb-14">
              <div className="pointer-events-auto max-w-3xl rounded-3xl border border-white/25 bg-background/30 p-5 text-white backdrop-blur-sm sm:p-8">
                <h1 className="text-2xl font-bold leading-tight text-white sm:text-4xl md:text-6xl">
                  Build minimal forms
                  <br />
                  that give you{" "}
                  <span className="inline-block">
                    <ContainerTextFlip
                      words={["insights", "analytics", "data"]}
                      className="!text-white [background:linear-gradient(to_bottom,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] !shadow-none dark:!text-white dark:[background:linear-gradient(to_bottom,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] dark:!shadow-none"
                      textClassName="text-white"
                    />
                  </span>
                </h1>

                <p className="mt-4 text-xs text-white/85 sm:text-sm md:text-base">
                  Watch the demo below, then scroll to interact with live sample
                  charts and tables.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="demo-video"
          className="border-t border-border/60 bg-background px-4 py-14 sm:px-8 sm:py-16"
        >
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Product demo
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl md:text-4xl">
                See how DIY Forms works
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                A quick walkthrough of building a form, sharing it, and exploring
                responses—before you sign up.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-md">
              <div className="relative aspect-video w-full">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${DEMO_VIDEO_ID}`}
                  title="DIY Forms product demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </div>

            <p className="mt-4 text-center text-sm">
              <a
                href={DEMO_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
              >
                Watch on YouTube
              </a>
            </p>
          </div>
        </section>

        <section
          id="demo-charts"
          className="border-t border-border/60 bg-muted/30 px-4 py-14 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-2xl font-bold sm:text-3xl md:text-4xl">
                Sample analytics
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                These charts and tables are wired with demo data so you can
                hover, click, and see how DIY Forms presents responses—not a
                static screenshot.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              <div className="flex min-h-[220px] flex-col rounded-2xl border border-border/80 bg-card p-3 shadow-sm sm:min-h-[260px] lg:min-h-[300px]">
                <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Choice breakdown
                </p>
                <div className="min-h-0 flex-1">
                  <RadioGroupFieldset />
                </div>
              </div>

              <div className="flex min-h-[220px] flex-col rounded-2xl border border-border/80 bg-card p-3 shadow-sm sm:min-h-[260px]">
                <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Category mix
                </p>
                <div className="min-h-0 flex-1">
                  <ChartPieLabel />
                </div>
              </div>

              <div className="flex min-h-[220px] flex-col rounded-2xl border border-border/80 bg-card p-3 shadow-sm sm:min-h-[260px]">
                <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Learners over time
                </p>
                <div className="min-h-0 flex-1">
                  <LearnersBarChart />
                </div>
              </div>

              <div className="flex min-h-[220px] flex-col rounded-2xl border border-border/80 bg-card p-3 shadow-sm sm:min-h-[260px]">
                <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Skill radar
                </p>
                <div className="min-h-0 flex-1">
                  <SkillsRadarChart />
                </div>
              </div>

              <div className="flex min-h-[220px] flex-col rounded-2xl border border-border/80 bg-card p-3 shadow-sm sm:min-h-[260px]">
                <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Response table
                </p>
                <div className="min-h-0 flex-1 overflow-hidden">
                  <TableDemo />
                </div>
              </div>

              <div className="flex min-h-[220px] flex-col rounded-2xl border border-border/80 bg-card p-3 shadow-sm sm:min-h-[260px]">
                <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Project status
                </p>
                <div className="min-h-0 flex-1">
                  <ProjectsDonutChart />
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer className="mt-20 border-t border-border/60 pt-12">
  <div className="mx-auto max-w-6xl">
    <div className="flex flex-col items-center text-center">
      <h3 className="font-serif text-3xl font-bold">
        Ready to build your first form?
      </h3>

      <p className="mt-3 max-w-xl text-muted-foreground">
        Create beautiful forms, collect responses, and explore insightful
        analytics—all in minutes.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={() => setAuthMode("signup")}>
          Create your first form
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={() => setAuthMode("login")}
        >
          Log in
        </Button>
      </div>
    </div>

    <div className="my-12 h-px bg-border" />

    <div className="grid gap-10 md:grid-cols-3">
      <div>
        <h4 className="text-lg font-semibold">DIY Forms</h4>

        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          A minimal form builder focused on clean design, fast sharing, and
          beautiful response analytics.
        </p>
      </div>

      <div>
        <h4 className="font-medium">Product</h4>

        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            <a href="#demo-video" className="hover:text-foreground">
              Demo
            </a>
          </li>

          <li>
            <a href="#demo-charts" className="hover:text-foreground">
              Analytics
            </a>
          </li>

          <li>
            <button
              onClick={() => setAuthMode("signup")}
              className="hover:text-foreground"
            >
              Sign up
            </button>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-medium">Resources</h4>

        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            <a
              href={DEMO_VIDEO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Watch Demo
            </a>
          </li>

          <li>
            <a
              href="mailto:hello@diyforms.in"
              className="hover:text-foreground"
            >
              Contact
            </a>
          </li>

          <li>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 py-6 text-sm text-muted-foreground sm:flex-row">
      <p>© {new Date().getFullYear()} DIY Forms. All rights reserved.</p>

      <div className="flex gap-6">
        <a href="/privacy" className="hover:text-foreground">
          Privacy
        </a>

        <a href="/terms" className="hover:text-foreground">
          Terms
        </a>
      </div>
    </div>
  </div>
</footer>
      </div>
    </>
  )
}

export default LandingPage
