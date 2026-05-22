"use client"

import { useState } from "react"
import { Loader2Icon } from "lucide-react"

import { useAuth } from "@/contexts/auth-provider"
import { ApiRequestError } from "@/lib/api"
import { Button } from "@/components/ui/button"
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

type AuthMode = "login" | "signup" | null

type AuthDialogsProps = {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
}

export function AuthDialogs({ mode, onModeChange }: AuthDialogsProps) {
  return (
    <>
      <LoginDialog
        open={mode === "login"}
        onOpenChange={(open) => onModeChange(open ? "login" : null)}
        onSwitchToSignup={() => onModeChange("signup")}
      />
      <SignupDialog
        open={mode === "signup"}
        onOpenChange={(open) => onModeChange(open ? "signup" : null)}
        onSwitchToLogin={() => onModeChange("login")}
      />
    </>
  )
}

function LoginDialog({
  open,
  onOpenChange,
  onSwitchToSignup,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignup: () => void
}) {
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const isEmail = identifier.includes("@")
      await login(
        isEmail
          ? { email: identifier, password }
          : { username: identifier, password }
      )
      onOpenChange(false)
      setIdentifier("")
      setPassword("")
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Login failed. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome back</DialogTitle>
          <DialogDescription>
            Sign in with your email or username and password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-identifier">Email or username</FieldLabel>
              <Input
                id="login-identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="username"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Sign in
            </Button>
          </DialogFooter>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={onSwitchToSignup}
          >
            Create one
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}

function SignupDialog({
  open,
  onOpenChange,
  onSwitchToLogin,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToLogin: () => void
}) {
  const { signup } = useAuth()
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await signup({ name, username, email, password })
      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Signup failed. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSuccess(false)
      setName("")
      setUsername("")
      setEmail("")
      setPassword("")
      setError(null)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create your account</DialogTitle>
          <DialogDescription>
            {success
              ? "Account created. Sign in to continue."
              : "Start building forms with analytics in minutes."}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <DialogFooter>
            <Button type="button" onClick={onSwitchToLogin} className="w-full">
              Go to sign in
            </Button>
          </DialogFooter>
        ) : (
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="signup-name">Full name</FieldLabel>
                <Input
                  id="signup-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-username">Username</FieldLabel>
                <Input
                  id="signup-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </Field>
              {error && <FieldError>{error}</FieldError>}
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting && <Loader2Icon className="animate-spin" />}
                Create account
              </Button>
            </DialogFooter>
          </form>
        )}

        {!success && (
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={onSwitchToLogin}
            >
              Sign in
            </button>
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
