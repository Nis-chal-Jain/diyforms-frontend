"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { utils, writeFile } from "xlsx"
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MessageSquareIcon,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-provider"
import {
  fetchFormBySlug,
  fetchFormResponses,
  fetchFormAnalytics,
  fetchMyForms,
} from "@/lib/api"

import type { FormDetail, FormSummary } from "@/types/form"
import type { FormResponse } from "@/types/response"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Skeleton } from "@/components/ui/skeleton"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const PAGE_SIZE = 10

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatAnswerValue(value: string | number | string[]) {
  if (Array.isArray(value)) return value.join(", ")
  return String(value)
}

export function ResponsesView() {
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const [forms, setForms] = useState<FormSummary[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string>(
    () => searchParams.get("slug") ?? ""
  )

  const [formDetail, setFormDetail] = useState<FormDetail | null>(null)
  const [responses, setResponses] = useState<FormResponse[]>([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)

  const [formsLoading, setFormsLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [analytics, setAnalytics] = useState<any | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<
    "responses" | "analytics"
  >("responses")

  useEffect(() => {
    async function loadAnalytics() {
      if (activeTab !== "analytics" || !selectedSlug) return

      setAnalyticsLoading(true)
      setAnalyticsError(null)

      try {
        const data = await fetchFormAnalytics(selectedSlug)
        setAnalytics(data)
      } catch (e) {
        setAnalytics(null)
        setAnalyticsError("Could not load analytics for this form.")
      } finally {
        setAnalyticsLoading(false)
      }
    }

    loadAnalytics()
  }, [activeTab, selectedSlug])

  useEffect(() => {
    async function loadForms() {
      setFormsLoading(true)

      try {
        const data = await fetchMyForms()

        setForms(data)

        if (data.length > 0) {
          setSelectedSlug((prev) => prev || data[0].formSlug)
        }
      } catch {
        setError("Could not load your forms.")
      } finally {
        setFormsLoading(false)
      }
    }

    loadForms()
  }, [])

  const loadResponses = useCallback(async () => {
    if (!selectedSlug) return

    setDataLoading(true)
    setError(null)

    try {
      const [detail, data] = await Promise.all([
        fetchFormBySlug(selectedSlug),
        fetchFormResponses(selectedSlug, page, PAGE_SIZE),
      ])

      setFormDetail(detail)
      setResponses(data.responses)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      setFormDetail(null)
      setResponses([])
      setError("Could not load responses for this form.")
    } finally {
      setDataLoading(false)
    }
  }, [selectedSlug, page])

  useEffect(() => {
    loadResponses()
  }, [loadResponses])

  function handleFormChange(slug: string) {
    setSelectedSlug(slug)
    setPage(1)
  }

  async function handleDownloadXlsx() {
    if (!formDetail || responses.length === 0) return

    setDownloadLoading(true)

    try {
      const headers = [
        "Submitted",
        "Respondent",
        ...formDetail.questions.map((question) => question.label),
      ]

      const rows = responses.map((response) => {
        const answerMap = new Map(
          response.answers.map((answer) => [
            answer.questionId,
            answer.value,
          ])
        )

        return [
          formatDateTime(response.createdAt),
          response.email ?? "Anonymous",
          ...formDetail.questions.map((question) =>
            formatAnswerValue(answerMap.get(question._id) ?? "")
          ),
        ]
      })

      const worksheet = utils.aoa_to_sheet([headers, ...rows])

      const workbook = utils.book_new()

      utils.book_append_sheet(workbook, worksheet, "Responses")

      writeFile(
        workbook,
        `${formDetail.formSlug}-responses.xlsx`
      )
    } catch {
      setError("Could not download responses. Please try again.")
    } finally {
      setDownloadLoading(false)
    }
  }

  const totalCollected =
    user?.usage?.responsesCollected ?? 0

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <MessageSquareIcon className="size-5 text-primary" />

            <span className="font-semibold tracking-tight">
              Responses
            </span>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeftIcon />
              Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Collected responses
          </h1>

          <p className="text-sm text-muted-foreground">
            {totalCollected} total across all forms
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Select a form</CardTitle>

              <CardDescription>
                View submissions for each form you own
              </CardDescription>
            </div>

            <Button
              size="sm"
              disabled={
                !formDetail ||
                responses.length === 0 ||
                downloadLoading
              }
              onClick={handleDownloadXlsx}
            >
              {downloadLoading
                ? "Downloading..."
                : "Download XLSX"}
            </Button>
          </CardHeader>

          <CardContent>
            {formsLoading ? (
              <Skeleton className="h-9 w-full max-w-md" />
            ) : forms.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No forms yet. Create a form from the dashboard
                to collect responses.
              </p>
            ) : (
              <select
                value={selectedSlug}
                onChange={(e) =>
                  handleFormChange(e.target.value)
                }
                className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {forms.map((form) => (
                  <option
                    key={form._id}
                    value={form.formSlug}
                  >
                    {form.title} (
                    {form.totalResponses} responses)
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>

        {selectedSlug && formDetail && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-medium">
                {formDetail.title}
              </h2>

              <Badge variant="outline">
                {formDetail.formSlug}
              </Badge>

              <Badge>
                {total} response
                {total !== 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="mt-4 flex w-full gap-2 rounded-md border border-border bg-muted p-1">
              <button
                type="button"
                onClick={() => setActiveTab("responses")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition text-center ${
                  activeTab === "responses"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Responses
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition text-center ${
                  activeTab === "analytics"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Analytics
              </button>
            </div>
          </>
        )}

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}

        {activeTab === "analytics" ? (
  <Card>
    <CardContent className="pt-6">
      {analyticsLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : analyticsError ? (
        <p className="text-sm text-destructive">
          {analyticsError}
        </p>
      ) : !analytics ? (
        <p className="text-sm text-muted-foreground">
          No analytics available for this form.
        </p>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-2xl font-bold">
              {analytics.totalResponses}
            </h3>

            <p className="text-sm text-muted-foreground">
              Total Responses
            </p>

            {analytics.lastUpdated && (
              <p className="mt-2 text-xs text-muted-foreground">
                Last updated:{" "}
                {new Date(
                  analytics.lastUpdated
                ).toLocaleString()}
              </p>
            )}
          </div>

          <div className="space-y-5">
            {analytics.questionsAnalytics?.map(
              (qa: any) => {
                const question =
                  formDetail?.questions.find(
                    (q) =>
                      q._id ===
                      String(qa.questionId)
                  )

                return (
                  <div
                    key={String(qa.questionId)}
                    className="rounded-xl border bg-card p-5 shadow-sm"
                  >
                    <div className="mb-4">
                      <h4 className="text-base font-semibold">
                        {question
                          ? question.label
                          : `Question ${qa.questionId}`}
                      </h4>

                      <p className="mt-1 text-sm text-muted-foreground capitalize">
                        {qa.type} question
                      </p>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {qa.type === "number" &&
                      qa.numberStats ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                          <div className="rounded-lg border p-3">
                            <div className="text-xs text-muted-foreground">
                              Count
                            </div>

                            <div className="mt-1 text-lg font-semibold text-foreground">
                              {
                                qa.numberStats
                                  .count
                              }
                            </div>
                          </div>

                          <div className="rounded-lg border p-3">
                            <div className="text-xs text-muted-foreground">
                              Min
                            </div>

                            <div className="mt-1 text-lg font-semibold text-foreground">
                              {qa.numberStats
                                .min ?? "-"}
                            </div>
                          </div>

                          <div className="rounded-lg border p-3">
                            <div className="text-xs text-muted-foreground">
                              Max
                            </div>

                            <div className="mt-1 text-lg font-semibold text-foreground">
                              {qa.numberStats
                                .max ?? "-"}
                            </div>
                          </div>

                          <div className="rounded-lg border p-3">
                            <div className="text-xs text-muted-foreground">
                              Mean
                            </div>

                            <div className="mt-1 text-lg font-semibold text-foreground">
                              {qa.numberStats
                                .mean ?? "-"}
                            </div>
                          </div>

                          <div className="rounded-lg border p-3">
                            <div className="text-xs text-muted-foreground">
                              Median
                            </div>

                            <div className="mt-1 text-lg font-semibold text-foreground">
                              {qa.numberStats
                                .median ?? "-"}
                            </div>
                          </div>

                          <div className="rounded-lg border p-3">
                            <div className="text-xs text-muted-foreground">
                              Mode
                            </div>

                            <div className="mt-1 text-lg font-semibold text-foreground">
                              {qa.numberStats
                                .mode ?? "-"}
                            </div>
                          </div>
                        </div>
                      ) : qa.type ===
                          "radio" &&
                        qa.optionStats ? (
                        <div className="overflow-x-auto">
                          <div className="min-w-[320px]">
                            <div className="h-[340px] w-full">
                              <ResponsiveContainer
                                width="100%"
                                height="100%"
                              >
                                <PieChart>
                                  <Pie
                                    data={
                                      qa.optionStats
                                    }
                                    dataKey="count"
                                    nameKey="option"
                                    cx="50%"
                                    cy="45%"
                                    outerRadius={
                                      95
                                    }
                                    innerRadius={
                                      55
                                    }
                                    paddingAngle={
                                      3
                                    }
                                    label={({
                                      percent,
                                    }) =>
                                      percent
                                        ? `${(
                                            percent *
                                            100
                                          ).toFixed(
                                            0
                                          )}%`
                                        : ""
                                    }
                                    labelLine={
                                      false
                                    }
                                  >
                                    {qa.optionStats.map(
                                      (
                                        _: any,
                                        idx: number
                                      ) => (
                                        <Cell
                                          key={`cell-${idx}`}
                                          fill={
                                            CHART_COLORS[
                                              idx %
                                                CHART_COLORS.length
                                            ]
                                          }
                                        />
                                      )
                                    )}
                                  </Pie>

                                  <ReTooltip />

                                  <Legend
                                    verticalAlign="bottom"
                                    height={
                                      36
                                    }
                                    wrapperStyle={{
                                      fontSize:
                                        "12px",
                                    }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      ) : qa.type ===
                          "checkbox" &&
                        qa.checkboxStats ? (
                        <div className="overflow-x-auto">
                          <div className="min-w-[500px]">
                            <div className="h-[360px] w-full">
                              <ResponsiveContainer
                                width="100%"
                                height="100%"
                              >
                                <BarChart
                                  data={
                                    qa.checkboxStats
                                  }
                                  margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 60,
                                  }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />

                                  <XAxis
                                    dataKey="option"
                                    angle={
                                      -20
                                    }
                                    textAnchor="end"
                                    interval={0}
                                    height={
                                      70
                                    }
                                    tick={{
                                      fontSize: 12,
                                    }}
                                  />

                                  <YAxis allowDecimals={false} />

                                  <ReTooltip />

                                  <Bar
                                    dataKey="count"
                                    radius={[
                                      6,
                                      6,
                                      0,
                                      0,
                                    ]}
                                  >
                                    {qa.checkboxStats.map(
                                      (
                                        _: any,
                                        idx: number
                                      ) => (
                                        <Cell
                                          key={`bar-${idx}`}
                                          fill={
                                            CHART_COLORS[
                                              idx %
                                                CHART_COLORS.length
                                            ]
                                          }
                                        />
                                      )
                                    )}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border p-4">
                          <div className="text-xs text-muted-foreground">
                            Count
                          </div>

                          <div className="mt-1 text-xl font-semibold text-foreground">
                            {qa.numberStats
                              ?.count ?? 0}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              {dataLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !selectedSlug ||
                forms.length === 0 ||
                !formDetail ? null : responses.length ===
                0 ? (
                <p className="text-sm text-muted-foreground">
                  No responses for this form yet.
                </p>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Submitted</TableHead>

                        <TableHead>
                          Respondent
                        </TableHead>

                        {formDetail.questions.map(
                          (question) => (
                            <TableHead
                              key={question._id}
                            >
                              {question.label}
                            </TableHead>
                          )
                        )}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {responses.map((response) => {
                        const answerMap = new Map(
                          response.answers.map(
                            (answer) => [
                              answer.questionId,
                              answer.value,
                            ]
                          )
                        )

                        return (
                          <TableRow
                            key={response._id}
                          >
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {formatDateTime(
                                response.createdAt
                              )}
                            </TableCell>

                            <TableCell>
                              {response.email ?? (
                                <span className="text-muted-foreground">
                                  Anonymous
                                </span>
                              )}
                            </TableCell>

                            {formDetail.questions.map(
                              (question) => (
                                <TableCell
                                  key={`${response._id}-${question._id}`}
                                >
                                  {formatAnswerValue(
                                    answerMap.get(
                                      question._id
                                    ) ?? ""
                                  )}
                                </TableCell>
                              )
                            )}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            page <= 1 || dataLoading
                          }
                          onClick={() =>
                            setPage((p) => p - 1)
                          }
                        >
                          <ChevronLeftIcon />
                          Previous
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            page >= totalPages ||
                            dataLoading
                          }
                          onClick={() =>
                            setPage((p) => p + 1)
                          }
                        >
                          Next
                          <ChevronRightIcon />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}