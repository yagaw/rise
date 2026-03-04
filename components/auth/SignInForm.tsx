"use client"
import Checkbox from "@/components/form/input/Checkbox"
import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import Button from "@/components/ui/button/Button"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { EyeCloseIcon, EyeIcon } from "@/icons"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useMemo, useState } from "react"

export default function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [showPassword, setShowPassword] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
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
    <div className="flex w-full flex-1 items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <div className="mb-6">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Welcome to RISE Dashboard
          </h1>
          <h3 className="mb-2 font-semibold text-gray-800 text-base dark:text-white/90 sm:text-lg">
            Sign In
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {activeUserEmail && (
              <div className="rounded-lg border border-gray-200 px-4 py-3 text-sm dark:border-gray-800">
                <p className="text-gray-700 dark:text-gray-300">
                  Signed in as{" "}
                  <span className="font-medium">{activeUserEmail}</span>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Signed in as{" "}
                  <span className="font-medium">{activeUserEmail}</span>
                </p>
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={handleSwitchAccount}
                    className="text-error-500 hover:text-error-600"
                  >
                    Change account
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-error-500" role="alert">
                {error}
              </p>
            )}

            <div>
              <Label>
                Email <span className="text-error-500">*</span>{" "}
              </Label>
              <Input
                type="email"
                placeholder="info@gmail.com"
                defaultValue={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <Label>
                Password <span className="text-error-500">*</span>{" "}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  defaultValue={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                  Keep me logged in
                </span>
              </div>
              <Link
                href="/reset-password"
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="sm"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
