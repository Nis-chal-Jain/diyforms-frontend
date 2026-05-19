"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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

export const description = "A bar chart"

const chartData = [
  { Lang: "Ruby", Learners: 186 },
  { Lang: "Python", Learners: 305 },
  { Lang: "Java", Learners: 237 },
  { Lang: "Rust", Learners: 73 },
  { Lang: "JavaScript", Learners: 209 },
  { Lang: "GO", Learners: 214 },
]

const chartConfig = {
  Learners: {
    label: "Learners",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartBarDefault() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Languages learnt by students</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="Lang"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="Learners" fill="var(--color-Learners)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
