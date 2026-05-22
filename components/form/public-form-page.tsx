"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Loader2Icon, LockIcon, ShieldXIcon } from "lucide-react"

import { AuthDialogs } from "@/components/auth/auth-dialogs"
import { QuestionField, type AnswerValue } from "@/components/form/question-field"
import { useAuth } from "@/contexts/auth-provider"
import {
  ApiRequestError,
  fetchFormBySlug,
  submitFormResponse,
} from "@/lib/api"
import type { FormAccessState, FormDetail } from "@/types/form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FieldError } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"

type PublicFormPageProps = {
  slug: string
}

export function PublicFormPage({ slug }: PublicFormPageProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [form, setForm] = useState<FormDetail | null>(null)
  const [accessState, setAccessState] = useState<FormAccessState>("loading")
  const [accessMessage, setAccessMessage] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null)

  const loadForm = useCallback(async () => {
    setAccessState("loading")
    setAccessMessage(null)
    setSubmitError(null)
    setSubmitted(false)

    try {
      const data = await fetchFormBySlug(slug)

      if (data.settings.status !== "published") {
        setForm(null)
        setAccessState("not_found")
        setAccessMessage("This form does not exist or was removed.")
        return
      }

      setForm(data)
      setAccessState("ready")
      setAnswers({})
    } catch (err) {
      setForm(null)
      if (err instanceof ApiRequestError) {
        setAccessMessage(err.message)
        if (err.statusCode === 401) {
          setAccessState("login_required")
          return
        }
        if (err.statusCode === 403) {
          setAccessState("access_denied")
          return
        }
        if (err.statusCode === 404) {
          setAccessState("not_found")
          return
        }
        if (
          err.statusCode === 400 &&
          err.message.toLowerCase().includes("already submitted")
        ) {
          setAccessState("already_submitted")
          return
        }
      }
      setAccessState("not_found")
      setAccessMessage("Form not found.")
    }
  }, [slug])

  useEffect(() => {
    if (authLoading) return
    loadForm()
  }, [authLoading, isAuthenticated, loadForm])

  function setAnswer(questionId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function validateAnswers(): string | null {
    if (!form) return "Form not loaded"

    for (const question of form.questions) {
      const value = answers[question._id]
      if (!question.required) continue

      if (value === undefined || value === "" || value === null) {
        return `"${question.label}" is required`
      }
      if (
        question.type === "checkbox" &&
        (!Array.isArray(value) || value.length === 0)
      ) {
        return `"${question.label}" is required`
      }
    }
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form || accessState !== "ready") return

    const validationError = validateAnswers()
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    const payload = form.questions
      .filter((q) => {
        const v = answers[q._id]
        return v !== undefined && v !== "" && v !== null
      })
      .map((q) => ({
        questionId: q._id,
        value: answers[q._id] as string | number | string[],
      }))

    try {
      await submitFormResponse(slug, payload)
      setSubmitted(true)
    } catch (err) {
      setSubmitError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to submit. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || accessState === "loading") {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <AuthDialogs mode={authMode} onModeChange={setAuthMode} />

      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to home
          </Link>
        </div>

        {accessState === "not_found" && (
          <AccessCard
            title="Form not found"
            description={
              accessMessage ?? "This form does not exist or was removed."
            }
          />
        )}

        {accessState === "login_required" && (
          <AccessCard
            icon={<LockIcon className="size-8 text-primary" />}
            title="Login required"
            description={
              accessMessage ??
              "This is a restricted form. Sign in to continue."
            }
            action={
              <Button onClick={() => setAuthMode("login")}>Sign in</Button>
            }
          />
        )}

        {accessState === "access_denied" && (
          <AccessCard
            icon={<ShieldXIcon className="size-8 text-destructive" />}
            title="Access denied"
            description={
              accessMessage ??
              "You are not on the allowed list for this form."
            }
          />
        )}

        {accessState === "already_submitted" && (
          <AccessCard
            title="Already submitted"
            description={
              accessMessage ?? "You have already submitted this form."
            }
          />
        )}

        {accessState === "ready" && form && (
          <>
            <AlertDialog
              open={submitted}
              onOpenChange={(open) => {
                if (!open) setSubmitted(false)
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Response submitted</AlertDialogTitle>
                  <AlertDialogDescription>
                    Thank you! Your response has been submitted successfully.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                  <AlertDialogAction
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{form.title}</CardTitle>
                  {form.settings.restricted && (
                    <Badge variant="outline">Restricted</Badge>
                  )}
                </div>
                {form.description && (
                  <CardDescription>{form.description}</CardDescription>
                )}
              </CardHeader>

              {submitted ? (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Thank you! Your response has been submitted successfully.
                  </p>
                </CardContent>
              ) : (
                <form onSubmit={handleSubmit}>
                  <CardContent className="flex flex-col gap-6">
                    {[...form.questions]
                      .sort((a, b) => a.order - b.order)
                      .map((question) => (
                        <QuestionField
                          key={question._id}
                          question={question}
                          value={answers[question._id]}
                          onChange={(v) => setAnswer(question._id, v)}
                          disabled={submitting}
                        />
                      ))}
                    {submitError && <FieldError>{submitError}</FieldError>}
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting && <Loader2Icon className="animate-spin" />}
                      Submit
                    </Button>
                  </CardFooter>
                </form>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

function AccessCard({
  title,
  description,
  icon,
  action,
}: {
  title: string
  description: string
  icon?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        {icon}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && (
        <CardFooter className="justify-center">{action}</CardFooter>
      )}
    </Card>
  )
}
