"use client"

import { useEffect, useState } from "react"
import { Loader2Icon } from "lucide-react"

import { ApiRequestError, forgotPasswordSend, forgotPasswordVerifyOtp } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("")
  const [stage, setStage] = useState<"send" | "verify" | "done">("send")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const [cooldown, setCooldown] = useState(0)
  const RESEND_COOLDOWN = 30

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(t)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [cooldown])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const isEmail = identifier.includes("@")
      await forgotPasswordSend(
        isEmail ? { email: identifier } : { username: identifier }
      )
      setCooldown(RESEND_COOLDOWN)
      setStage("verify")
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to send OTP")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be a 6 digit code")
      return
    }

    setIsSubmitting(true)
    try {
      const isEmail = identifier.includes("@")
      await forgotPasswordVerifyOtp(
        isEmail
          ? { email: identifier, otp, newPassword }
          : { username: identifier, otp, newPassword }
      )
      setStage("done")
      // redirect to home or login after short delay
      setTimeout(() => router.push("/"), 1200)
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to verify OTP")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0) return
    setError(null)
    setIsSubmitting(true)
    try {
      const isEmail = identifier.includes("@")
      await forgotPasswordSend(
        isEmail ? { email: identifier } : { username: identifier }
      )
      setCooldown(RESEND_COOLDOWN)
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to resend OTP")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {stage === "send" && (
        <form onSubmit={handleSend}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fp-identifier">Email or username</FieldLabel>
              <Input
                id="fp-identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="you@example.com or username"
                autoComplete="username"
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>

          <div className="mt-6">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Send OTP
            </Button>
          </div>
        </form>
      )}

      {stage === "verify" && (
        <form onSubmit={handleVerify}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fp-otp">OTP</FieldLabel>
              <Input
                id="fp-otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6 digit code"
                required
                inputMode="numeric"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fp-new-password">New password</FieldLabel>
              <Input
                id="fp-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fp-confirm-password">Confirm password</FieldLabel>
              <Input
                id="fp-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>

          <div className="mt-6 flex gap-3 items-center">
            <Button type="button" variant="secondary" onClick={() => setStage("send")}>Back</Button>
            <div className="flex-1 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                disabled={cooldown > 0 || isSubmitting}
                className="whitespace-nowrap"
              >
                {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend OTP"}
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2Icon className="animate-spin" />}
                Reset password
              </Button>
            </div>
          </div>
        </form>
      )}

      {stage === "done" && (
        <div className="p-6 rounded-md border bg-muted text-center">
          <h3 className="font-medium">Password reset successful</h3>
          <p className="text-sm text-muted-foreground mt-2">You will be redirected shortly.</p>
        </div>
      )}
    </div>
  )
}
