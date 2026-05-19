"use client"

import { ContainerTextFlip } from "@/components/ui/container-text-flip"

import { ChartBarDefault } from "@/components/language-chart"
import { ChartPieLabel } from "@/components/categories"

import {
  LearnersBarChart,
  UsersLineChart,
  SkillsRadarChart,
  ProjectsDonutChart,
} from "@/components/morecharts"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black text-white">

      {/* ================= BACKGROUND CHARTS ================= */}
      <div className="absolute inset-0 z-0 grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 lg:p-6">

        {/* MOBILE + TABLET + DESKTOP */}
        <div className="h-[180px] sm:h-[220px] lg:h-[260px] rounded-2xl bg-white/5 p-2">
          <ChartBarDefault />
        </div>

        <div className="h-[180px] sm:h-[220px] lg:h-[260px] rounded-2xl bg-white/5 p-2">
          <ChartPieLabel />
        </div>

        {/* TABLET + DESKTOP ONLY */}
        <div className="hidden sm:block h-[180px] sm:h-[220px] lg:h-[260px] rounded-2xl bg-white/5 p-2">
          <LearnersBarChart />
        </div>

        <div className="hidden sm:block h-[180px] sm:h-[220px] lg:h-[260px] rounded-2xl bg-white/5 p-2">
          <UsersLineChart />
        </div>

        {/* DESKTOP ONLY */}
        <div className="hidden lg:block h-[180px] sm:h-[220px] lg:h-[260px] rounded-2xl bg-white/5 p-2">
          <SkillsRadarChart />
        </div>

        <div className="hidden lg:block h-[180px] sm:h-[220px] lg:h-[260px] rounded-2xl bg-white/5 p-2">
          <ProjectsDonutChart />
        </div>
      </div>

      {/* ================= OVERLAY ================= */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0),rgba(0,0,0,0.35))]" />

      {/* ================= HERO CONTENT ================= */}
      <div className="relative z-20 flex min-h-screen items-center justify-center px-4 text-center">

        <div className="pointer-events-auto max-w-3xl rounded-3xl bg-black/30 p-5 backdrop-blur-xl sm:p-8">

          <h1 className="text-2xl font-bold leading-tight sm:text-4xl md:text-6xl lg:text-7xl">
            Build minimal forms
            <br />
            that give you{" "}
            <span className="inline-block">
              <ContainerTextFlip words={["insights", "analytics", "data"]} />
            </span>
          </h1>

          <p className="mt-4 text-xs text-white/70 sm:text-sm md:text-base">
            Hover over charts in the background to interact with live analytics.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button className="w-full rounded-xl bg-white px-6 py-2 text-black sm:w-auto">
              Launching Soon!!
            </button>

            {/* <button className="w-full rounded-xl border border-white/30 px-6 py-2 sm:w-auto">
              View Dashboard
            </button> */}
          </div>

        </div>
      </div>
    </section>
  )
}