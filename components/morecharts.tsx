"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

/* =========================
   1. BAR CHART
========================= */

const barData = [
  { month: "Jan", learners: 120 },
  { month: "Feb", learners: 180 },
  { month: "Mar", learners: 220 },
  { month: "Apr", learners: 260 },
  { month: "May", learners: 300 },
  { month: "Jun", learners: 340 },
]

const barConfig = {
  learners: {
    label: "Learners",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function LearnersBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Learners</CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={barConfig} className="h-[300px] w-full">
          <BarChart data={barData}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
            />

            <YAxis />

            <ChartTooltip content={<ChartTooltipContent />} />

            <Bar
              dataKey="learners"
              fill="var(--color-learners)"
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* =========================
   2. LINE CHART
========================= */

const lineData = [
  { week: "W1", users: 400 },
  { week: "W2", users: 520 },
  { week: "W3", users: 610 },
  { week: "W4", users: 740 },
]

const lineConfig = {
  users: {
    label: "Active Users",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function UsersLineChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Active Users</CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={lineConfig} className="h-[300px] w-full">
          <LineChart data={lineData}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
            />

            <YAxis />

            <ChartTooltip content={<ChartTooltipContent />} />

            <Line
              type="monotone"
              dataKey="users"
              stroke="var(--color-users)"
              strokeWidth={3}
              dot
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* =========================
   3. RADAR CHART
========================= */

const radarData = [
  { skill: "React", value: 90 },
  { skill: "Node.js", value: 85 },
  { skill: "MongoDB", value: 80 },
  { skill: "DSA", value: 95 },
  { skill: "System Design", value: 70 },
]

const radarConfig = {
  value: {
    label: "Skill Level",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function SkillsRadarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Developer Skills</CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={radarConfig} className="h-[350px] w-full">
          <RadarChart data={radarData}>
            <PolarGrid />

            <PolarAngleAxis dataKey="skill" />

            <PolarRadiusAxis />

            <ChartTooltip content={<ChartTooltipContent />} />

            <Radar
              dataKey="value"
              fill="var(--color-value)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* =========================
   4. DONUT PIE CHART
========================= */

const donutData = [
  {
    category: "frontend",
    label: "Frontend",
    projects: 24,
    fill: "var(--color-frontend)",
  },
  {
    category: "backend",
    label: "Backend",
    projects: 18,
    fill: "var(--color-backend)",
  },
  {
    category: "ai",
    label: "AI/ML",
    projects: 12,
    fill: "var(--color-ai)",
  },
]

const donutConfig = {
  frontend: {
    label: "Frontend",
    color: "var(--chart-1)",
  },

  backend: {
    label: "Backend",
    color: "var(--chart-2)",
  },

  ai: {
    label: "AI/ML",
    color: "var(--chart-3)",
  },

  projects: {
    label: "Projects",
  },
} satisfies ChartConfig

export function ProjectsDonutChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects Distribution</CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={donutConfig}
          className="mx-auto aspect-square h-[300px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />

            <Pie
              data={donutData}
              dataKey="projects"
              nameKey="category"
              innerRadius={70}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}