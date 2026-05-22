"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import {
  FileTextIcon,
  LayoutDashboardIcon,
  Loader2Icon,
  LogOutIcon,
  MailCheckIcon,
  MessageSquareIcon,
  OctagonPauseIcon,
  PlayIcon,
  Edit2Icon,
  PlusIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-provider"
import {
  ApiRequestError,
  deleteForm,
  fetchMyForms,
  resumeFormResponses,
  sendEmailOtp,
  stopFormResponses,
  verifyEmailOtp,
} from "@/lib/api"
import type { FormSummary } from "@/types/form"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function statusVariant(
  status: FormSummary["settings"]["status"]
): "default" | "secondary" | "outline" {
  if (status === "published") return "default"
  if (status === "archived") return "outline"
  return "secondary"
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function DashboardView() {
  const { user, logout, refreshUser } = useAuth()
  const [forms, setForms] = useState<FormSummary[]>([])
  const [formsLoading, setFormsLoading] = useState(true)
  const [formsError, setFormsError] = useState<string | null>(null)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [actionSlug, setActionSlug] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadForms = useCallback(async () => {
    setFormsLoading(true)
    setFormsError(null)
    try {
      const data = await fetchMyForms()
      setForms(data)
    } catch {
      setFormsError("Could not load your forms. Please try again.")
    } finally {
      setFormsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadForms()
  }, [loadForms])

  async function handleStopResponses(form: FormSummary) {
    if (form.settings.status === "archived") return
    if (
      !window.confirm(
        `Stop responses for "${form.title}"? The form will be archived and no longer accept submissions.`
      )
    ) {
      return
    }

    setActionSlug(form.formSlug)
    setActionError(null)
    try {
      await stopFormResponses(form.formSlug)
      await loadForms()
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to stop responses."
      )
    } finally {
      setActionSlug(null)
    }
  }

  async function handleResumeResponses(form: FormSummary) {
    if (form.settings.status !== "archived") return
    if (
      !window.confirm(
        `Resume responses for "${form.title}"? The form will accept submissions again.`
      )
    ) {
      return
    }

    setActionSlug(form.formSlug)
    setActionError(null)
    try {
      await resumeFormResponses(form.formSlug)
      await loadForms()
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to resume responses."
      )
    } finally {
      setActionSlug(null)
    }
  }

  async function handleDeleteForm(form: FormSummary) {
    if (
      !window.confirm(
        `Delete "${form.title}" permanently? This cannot be undone.`
      )
    ) {
      return
    }

    setActionSlug(form.formSlug)
    setActionError(null)
    try {
      await deleteForm(form.formSlug)
      setForms((prev) => prev.filter((f) => f.formSlug !== form.formSlug))
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to delete form."
      )
    } finally {
      setActionSlug(null)
    }
  }

  async function openVerifyDialog() {
    setVerifyOpen(true)
    setOtp("")
    setVerifyError(null)
    setOtpSent(false)
    setVerifyLoading(true)
    try {
      await sendEmailOtp()
      setOtpSent(true)
    } catch (err) {
      setVerifyError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to send verification code."
      )
    } finally {
      setVerifyLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setVerifyError(null)
    setVerifyLoading(true)
    try {
      await verifyEmailOtp(otp)
      await refreshUser()
      setVerifyOpen(false)
      setOtp("")
      setOtpSent(false)
    } catch (err) {
      setVerifyError(
        err instanceof ApiRequestError
          ? err.message
          : "Verification failed. Please try again."
      )
    } finally {
      setVerifyLoading(false)
    }
  }

  async function resendOtp() {
    setVerifyError(null)
    setVerifyLoading(true)
    try {
      await sendEmailOtp()
      setOtpSent(true)
    } catch (err) {
      setVerifyError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to resend code."
      )
    } finally {
      setVerifyLoading(false)
    }
  }

  if (!user) return null

  const plan = user.subscription?.plan ?? "free"
  const formsCreated = user.usage?.formsCreated ?? forms.length
  const responsesCollected = user.usage?.responsesCollected ?? 0

  return (
    <div className="min-h-screen bg-background">
      <VerifyEmailDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        email={user.email}
        otp={otp}
        onOtpChange={setOtp}
        otpSent={otpSent}
        error={verifyError}
        loading={verifyLoading}
        onSubmit={handleVerifyOtp}
        onResend={resendOtp}
      />

      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <LayoutDashboardIcon className="size-5 text-primary" />
            <span className="font-semibold tracking-tight">DIY Forms</span>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Dashboard
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar size="sm">
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[140px] truncate text-sm sm:inline">
                  {user.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <UserIcon />
                @{user.username}
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <MailCheckIcon />
                {user.verified ? "Email verified" : "Email not verified"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => logout()}
              >
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-muted-foreground">
              Overview of your forms workspace and activity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{plan} plan</Badge>
            <Badge variant={user.verified ? "default" : "outline"}>
              {user.verified ? "Verified" : "Unverified"}
            </Badge>
            {!user.verified && (
              <Button size="sm" onClick={openVerifyDialog}>
                <MailCheckIcon />
                Verify email
              </Button>
            )}
            <Badge variant="outline">{user.role}</Badge>
          </div>
        </div>

        {!user.verified && (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Verify your email</p>
              <p className="text-sm text-muted-foreground">
                Email verification is required before you can create forms.
              </p>
            </div>
            <Button size="sm" onClick={openVerifyDialog} className="shrink-0">
              <MailCheckIcon />
              Verify email
            </Button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Forms created"
            value={formsCreated}
            description="Total forms in your account"
            icon={<FileTextIcon className="size-4 text-primary" />}
          />
          <StatCard
            title="Responses collected"
            value={responsesCollected}
            description="Across all published forms"
            icon={<MessageSquareIcon className="size-4 text-primary" />}
            action={
              <Button size="sm" variant="outline" className="mt-3 w-full" asChild>
                <Link href="/responses">
                  <MessageSquareIcon />
                  View responses
                </Link>
              </Button>
            }
          />
          <StatCard
            title="Subscription"
            value={plan}
            description={
              user.subscription?.isActive ? "Active" : "Inactive"
            }
            icon={<LayoutDashboardIcon className="size-4 text-primary" />}
            valueIsText
          />
          <StatCard
            title="Account"
            value={user.verified ? "Verified" : "Pending"}
            description={user.email}
            icon={<MailCheckIcon className="size-4 text-primary" />}
            valueIsText
            action={
              !user.verified ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={openVerifyDialog}
                >
                  Verify
                </Button>
              ) : undefined
            }
          />
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Your forms</CardTitle>
              <CardDescription>
                All forms you have created ({forms.length})
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/create">
                  <PlusIcon />
                  Create form
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/responses">
                  <MessageSquareIcon />
                  View responses
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {actionError && (
              <p className="mb-4 text-sm text-destructive">{actionError}</p>
            )}
            {formsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : formsError ? (
              <p className="text-sm text-destructive">{formsError}</p>
            ) : forms.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No forms yet. Create your first form to see it here.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Responses</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form._id}>
                      <TableCell className="max-w-[200px] font-medium">
                        <span className="line-clamp-1">{form.title}</span>
                        {form.description ? (
                          <span className="mt-0.5 block line-clamp-1 text-xs font-normal text-muted-foreground">
                            {form.description}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/${form.formSlug}`}
                          className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-primary hover:underline"
                        >
                          {form.formSlug}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(form.settings.status)}>
                          {form.settings.status=="published"?"Published":form.settings.status=="archived"?"Archived":"Draft"}
                        </Badge>
                        {form.settings.restricted && (
                          <Badge variant="outline" className="ml-1.5">
                            Restricted
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {form.totalResponses}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(form.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          {form.settings.status === "archived" ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={actionSlug === form.formSlug}
                              onClick={() => handleResumeResponses(form)}
                              title="Resume responses"
                            >
                              {actionSlug === form.formSlug ? (
                                <Loader2Icon className="animate-spin" />
                              ) : (
                                <PlayIcon />
                              )}
                              <span className="hidden sm:inline">Resume</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={actionSlug === form.formSlug}
                              onClick={() => handleStopResponses(form)}
                              title="Stop responses"
                            >
                              {actionSlug === form.formSlug ? (
                                <Loader2Icon className="animate-spin" />
                              ) : (
                                <OctagonPauseIcon />
                              )}
                              <span className="hidden sm:inline">Stop</span>
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            disabled={actionSlug === form.formSlug}
                          >
                            <Link href={`/responses?slug=${form.formSlug}`}>
                              <MessageSquareIcon />
                              <span className="hidden sm:inline">Responses</span>
                            </Link>
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            disabled={actionSlug === form.formSlug}
                          >
                            <Link href={`/edit/${form.formSlug}`}>
                              <Edit2Icon />
                              <span className="hidden sm:inline">Edit</span>
                            </Link>
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actionSlug === form.formSlug}
                            onClick={() => handleDeleteForm(form)}
                          >
                            {actionSlug === form.formSlug ? (
                              <Loader2Icon className="animate-spin" />
                            ) : (
                              <Trash2Icon />
                            )}
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function VerifyEmailDialog({
  open,
  onOpenChange,
  email,
  otp,
  onOtpChange,
  otpSent,
  error,
  loading,
  onSubmit,
  onResend,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  otp: string
  onOtpChange: (value: string) => void
  otpSent: boolean
  error: string | null
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onResend: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify your email</DialogTitle>
          <DialogDescription>
            {otpSent
              ? `Enter the 6-digit code sent to ${email}.`
              : `Sending a verification code to ${email}…`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="verify-otp">Verification code</FieldLabel>
              <Input
                id="verify-otp"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                disabled={!otpSent || loading}
                required
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onResend}
              disabled={loading}
            >
              Resend code
            </Button>
            <Button
              type="submit"
              disabled={!otpSent || otp.length !== 6 || loading}
            >
              {loading && <Loader2Icon className="animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function StatCard({
  title,
  value,
  description,
  icon,
  valueIsText = false,
  action,
}: {
  title: string
  value: number | string
  description: string
  icon: React.ReactNode
  valueIsText?: boolean
  action?: React.ReactNode
}) {
  return (
    <Card size="sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div
          className={
            valueIsText
              ? "text-xl font-semibold capitalize"
              : "text-3xl font-semibold tabular-nums"
          }
        >
          {value}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        {action}
      </CardContent>
    </Card>
  )
}
