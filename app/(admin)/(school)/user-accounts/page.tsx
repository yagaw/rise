"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PencilIcon, LockIcon, PlusIcon, HorizontaLDots } from "@/icons"
import { UserAccount } from "@/types/userAccount"
import { Organization } from "@/types/organization"

const formatDate = (value: string | null) => {
  if (!value) return "-"

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

const searchable = (value: unknown) =>
  value === undefined || value === null ? "" : String(value).toLowerCase()

const accessLabel = (
  account: UserAccount,
  orgMap: Map<string, Organization>,
) => {
  if (account.canManageAllOrganizations) return "All Organizations"
  const org = orgMap.get(account.organizationId)
  if (org) return org.short_title || org.name || org.title || account.organizationTitle || account.organizationId
  return account.organizationTitle || account.organizationId || "-"
}

const accessTagColor = (account: UserAccount) => {
  if (account.canManageAllOrganizations)
    return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
  return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
}

function RowActions({ accountId }: { accountId: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label="Row actions"
      >
        <HorizontaLDots className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <button
            onClick={() => { setOpen(false); router.push(`/user-accounts/edit/${accountId}`) }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <PencilIcon className="h-4 w-4 text-gray-400" />
            Edit Account
          </button>
          <button
            onClick={() => { setOpen(false); router.push(`/user-accounts/change-password/${accountId}`) }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <LockIcon className="h-4 w-4 text-gray-400" />
            Change Password
          </button>
        </div>
      )}
    </div>
  )
}

export default function UserAccountsPage() {
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([])
  const [orgMap, setOrgMap] = useState<Map<string, Organization>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, orgsRes] = await Promise.all([
          fetch("/api/user-accounts"),
          fetch("/api/organizations"),
        ])

        const accountsData = (await accountsRes.json()) as UserAccount[] | { error?: string }
        if (!accountsRes.ok) {
          throw new Error(
            "error" in accountsData
              ? accountsData.error || "Failed to load user accounts"
              : "",
          )
        }
        setUserAccounts(Array.isArray(accountsData) ? accountsData : [])

        if (orgsRes.ok) {
          const orgsData = (await orgsRes.json()) as Organization[]
          const map = new Map<string, Organization>()
          if (Array.isArray(orgsData)) {
            for (const org of orgsData) map.set(org.id, org)
          }
          setOrgMap(map)
        }
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

    fetchData()
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
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                          {(account.displayName || account.email || "?").charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {account.displayName || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {account.email}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${accessTagColor(account)}`}
                        title={account.canManageAllOrganizations ? undefined : account.organizationTitle || account.organizationId}
                      >
                        {accessLabel(account, orgMap)}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex flex-wrap gap-1.5">
                        {enabledPermissions.length > 0
                          ? enabledPermissions.map((permission) => (
                              <span
                                key={permission}
                                className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium capitalize text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              >
                                {permission}
                              </span>
                            ))
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(account.lastSignInAt)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <RowActions accountId={account.id} />
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