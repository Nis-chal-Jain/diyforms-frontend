import ForgotPassword from "@/components/auth/forgot-password"

export const metadata = {
  title: "Forgot password",
}

export default function Page() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold mb-6">Forgot password</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter your email or username to receive an OTP for resetting your password.</p>
        <ForgotPassword />
      </div>
    </div>
  )
}
