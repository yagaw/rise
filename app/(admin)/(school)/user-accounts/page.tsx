"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LockIcon, PencilIcon, PlusIcon } from "@/icons"
import { UserAccount } from "@/types/userAccount"

const formatDate = (value: string | null) => {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

const searchable = (value: unknown) =>
  value === undefined || value === null ? "" : String(value).toLowerCase()

export default function UserAccountsPage() {
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchUserAccounts = async () => {
      try {
        const response = await fetch("/api/user-accounts")
        const data = (await response.json()) as UserAccount[] | { error?: string }

        if (!response.ok) {
          throw new Error(
            "error" in data ? data.error || "Failed to load user accounts" : "",
          )
        }

        setUserAccounts(Array.isArray(data) ? data : [])
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load user accounts.",
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAccounts()
  }, [])

  const filteredUserAccounts = useMemo(() => {
    const searchLower = searchTerm.toLowerCase()

    return userAccounts.filter(
      (account) =>
        searchable(account.email).includes(searchLower) ||
        searchable(account.displayName).includes(searchLower) ||
        searchable(account.organizationTitle).includes(searchLower) ||
        searchable(account.organizationId).includes(searchLower),
    )
  }, [searchTerm, userAccounts])

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
          <p>Loading user accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="User Accounts" />

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Accounts
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage Supabase users, organization access, and permissions.
            </p>
          </div>
          <Link href="/user-accounts/add">
            <Button className="inline-flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add User Account
            </Button>
          </Link>
        </div>

        {message && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {message}
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search user accounts..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow className="border-b border-gray-100 dark:border-gray-800">
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Display Name
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Email
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Access
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Permissions
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Last Sign In
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUserAccounts.length === 0 && (
                <TableRow>
                  <TableCell
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={6}
                  >
                    No user accounts found.
                  </TableCell>
                </TableRow>
              )}
              {filteredUserAccounts.map((account) => {
                const enabledPermissions = Object.entries(account.permissions)
                  .filter(([, enabled]) => enabled)
                  .map(([permission]) => permission)

                return (
                  <TableRow
                    key={account.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                      {account.displayName || "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {account.email}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {account.canManageAllOrganizations
                        ? "All Organizations"
                        : account.organizationTitle ||
                          account.organizationId ||
                          "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex flex-wrap gap-1.5">
                        {enabledPermissions.length > 0
                          ? enabledPermissions.map((permission) => (
                              <span
                                key={permission}
                                className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium capitalize text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {permission}
                              </span>
                            ))
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(account.lastSignInAt)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/user-accounts/edit/${account.id}`}>
                          <button className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </Link>
                        <Link
                          href={`/user-accounts/change-password/${account.id}`}
                        >
                          <button className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                            <LockIcon className="h-4 w-4" />
                          </button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
