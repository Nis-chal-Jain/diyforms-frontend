"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A pie chart with labels"

const chartData = [
  {
    category: "students",
    label: "Students",
    learners: 275,
    fill: "var(--color-students)",
  },
  {
    category: "unemployed",
    label: "Unemployed",
    learners: 200,
    fill: "var(--color-unemployed)",
  },
  {
    category: "employees-1yoe",
    label: "Employees <1YOE",
    learners: 187,
    fill: "var(--color-employees-1yoe)",
  },
  {
    category: "employees-over-1yoe",
    label: "Employees >1YOE",
    learners: 173,
    fill: "var(--color-employees-over-1yoe)",
  },
  {
    category: "other",
    label: "Other",
    learners: 90,
    fill: "var(--color-other)",
  },
]

const chartConfig = {
  learners: {
    label: "Learners",
  },

  students: {
    label: "Students",
    color: "var(--chart-1)",
  },

  unemployed: {
    label: "Unemployed",
    color: "var(--chart-2)",
  },

  "employees-1yoe": {
    label: "Employees <1YOE",
    color: "var(--chart-3)",
  },

  "employees-over-1yoe": {
    label: "Employees >1YOE",
    color: "var(--chart-4)",
  },

  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function ChartPieLabel() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Categories of learners</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square  pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />

            <Pie
              data={chartData}
              dataKey="learners"
              nameKey="category"
              label
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}