"use client"
import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import Button from "@/components/ui/button/Button"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { EyeCloseIcon, EyeIcon } from "@/icons"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useMemo, useState } from "react"

export default function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeUserEmail, setActiveUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser()
      setActiveUserEmail(data.user?.email ?? null)
    }
    checkSession()
  }, [supabase])

  const handleSwitchAccount = async () => {
    setError("")
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(signOutError.message)
      return
    }
    setActiveUserEmail(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!email.trim() || !password) {
      setError("Email and password are required.")
      return
    }

    try {
      setIsSubmitting(true)

      if (
        activeUserEmail &&
        activeUserEmail.toLowerCase() !== email.toLowerCase()
      ) {
        const { error: signOutError } = await supabase.auth.signOut()
        if (signOutError) {
          throw signOutError
        }
      }

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (signInError) {
        throw signInError
      }

      setActiveUserEmail(data.user?.email ?? null)
      const nextPath = searchParams.get("next") || "/"
      router.push(nextPath)
      router.refresh()
    } catch (signInError) {
      const message =
        signInError instanceof Error
          ? signInError.message
          : "Failed to sign in. Please try again."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="px-6 pt-8 pb-2 text-center sm:px-8">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo/rise-logo.webp"
              alt="RISE"
              width={120}
              height={120}
              className="mx-auto h-20 w-auto"
              priority
            />
          </Link>
          <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {activeUserEmail && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-900/30 dark:bg-brand-900/10">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {activeUserEmail}
                </p>
                <div className="mt-1 flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    Go to Dashboard
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    type="button"
                    onClick={handleSwitchAccount}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Switch account
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 px-4 py-3 dark:border-error-900/30 dark:bg-error-900/10">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-error-600 dark:text-error-400" role="alert">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <div className="mt-1 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  defaultValue={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="mt-1 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  defaultValue={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5"
                >
                  {showPassword ? (
                    <EyeIcon className="h-4 w-4 fill-gray-400 dark:fill-gray-500" />
                  ) : (
                    <EyeCloseIcon className="h-4 w-4 fill-gray-400 dark:fill-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <Link
                href="/reset-password"
                className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="md"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 sm:px-8 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
    )
  }