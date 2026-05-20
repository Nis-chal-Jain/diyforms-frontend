"use client"

import { ContainerTextFlip } from "@/components/ui/container-text-flip" 
import { ChartPieLabel } from "@/components/categories"
import { RadioGroupFieldset } from "@/components/radio"
import { TableDemo } from "@/components/tableex"
import {
  LearnersBarChart,
  UsersLineChart,
  SkillsRadarChart,
  ProjectsDonutChart,
} from "@/components/morecharts"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white text-black dark:bg-black dark:text-white">

      {/* ================= BACKGROUND CHARTS ================= */}
      <div className="absolute inset-0 z-0 grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 lg:p-6">

        {/* MOBILE + TABLET + DESKTOP */}
        <div className="h-[180px] rounded-2xl bg-black/5 p-2 sm:h-[220px] dark:bg-white/5 lg:h-[300px]">
          <div className="h-full w-full">
            <RadioGroupFieldset />
          </div>
        </div>

        <div className="h-[180px] rounded-2xl bg-black/5 p-2 sm:h-[220px] dark:bg-white/5 lg:h-[260px]">
          <ChartPieLabel />
        </div>

        {/* TABLET + DESKTOP ONLY */}
        <div className="hidden h-[180px] rounded-2xl bg-black/5 p-2 sm:block sm:h-[220px] dark:bg-white/5 lg:h-[260px]">
          <LearnersBarChart />
        </div>

        <div className="hidden h-[180px] rounded-2xl bg-black/5 p-2 dark:bg-white/5 lg:block lg:h-[260px]">
          <SkillsRadarChart />
        </div>

        {/* DESKTOP ONLY */}
        <div className="hidden h-[180px] rounded-2xl bg-black/5 p-2 sm:block sm:h-[220px] dark:bg-white/5 lg:h-[260px]">
          <TableDemo />
        </div>

        <div className="hidden h-[180px] rounded-2xl bg-black/5 p-2 dark:bg-white/5 lg:block lg:h-[260px]">
          <ProjectsDonutChart />
        </div>
      </div>

      {/* ================= OVERLAY ================= */}
      <div
        className="
          pointer-events-none absolute inset-0 z-10
          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0),rgba(255,255,255,0.55))]
          dark:bg-[radial-gradient(circle_at_center,rgba(0,0,0,0),rgba(0,0,0,0.35))]
        "
      />

      {/* ================= HERO CONTENT ================= */}
      <div className="pointer-events-none relative z-20 flex min-h-screen items-center justify-center px-4 text-center">

        <div className="pointer-events-auto max-w-3xl rounded-3xl bg-white/40 p-5 backdrop-blur-xl dark:bg-black/30 sm:p-8">

          <h1 className="text-2xl font-bold leading-tight sm:text-4xl md:text-6xl ">
            Build minimal forms
            <br />
            that give you{" "}
            <span className="inline-block">
              <ContainerTextFlip
                words={["insights", "analytics", "data"]}
              />
            </span>
          </h1>

          <p className="mt-4 text-xs text-black/70 dark:text-white/70 sm:text-sm md:text-base">
            Hover over charts in the background to interact with live analytics.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <button
              className="
                w-full rounded-xl px-6 py-2 transition
                bg-black text-white hover:bg-black/80
                dark:bg-white dark:text-black dark:hover:bg-white/80
                sm:w-auto
              "
            >
              Launching Soon!!
            </button>

          </div>

        </div>
      </div>
    </section>
  )
}