"use client"

import React, { FormEvent, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import Button from "@/components/ui/button/Button"
import { UserAccount } from "@/types/userAccount"

export default function ChangeUserAccountPasswordPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const userId = params.id
  const [account, setAccount] = useState<UserAccount | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchUserAccount = async () => {
      try {
        const response = await fetch(`/api/user-accounts/${userId}`)
        const data = (await response.json()) as UserAccount | { error?: string }

        if (!response.ok) {
          throw new Error(
            "error" in data ? data.error || "Failed to load user account" : "",
          )
        }

        setAccount(data as UserAccount)
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Failed to load user account.",
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAccount()
  }, [userId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage("")

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/user-accounts/${userId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password")
      }

      router.push("/user-accounts")
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to change password.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p>Loading user account...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Change Password" />

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Change Password
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {account?.email || "Update this user account password."}
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
            {message}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <Label htmlFor="password">New Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              defaultValue={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              defaultValue={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/user-accounts")}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Change Password
          </Button>
        </div>
      </form>
    </div>
  )
}
