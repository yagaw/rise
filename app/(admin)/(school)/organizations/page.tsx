"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Organization } from "@/types/organization"
import { School } from "@/types/school"
import { Teacher } from "@/types/teacher"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { PencilIcon, TrashBinIcon, PlusIcon } from "@/icons"

type OrganizationWithCounts = Organization & {
  schoolCount: number
  teacherCount: number
}

type SortField =
  | "title"
  | "short_title"
  | "type"
  | "ethnicity"
  | "schoolCount"
  | "teacherCount"

type SortDirection = "asc" | "desc"

const toSearchableText = (value: unknown) => {
  if (value === undefined || value === null) {
    return ""
  }

  return String(value).toLowerCase()
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("title")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [organizationToDelete, setOrganizationToDelete] = useState<
    string | null
  >(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgResponse, schoolResponse, teacherResponse] =
          await Promise.all([
            fetch("/api/organizations"),
            fetch("/api/schools"),
            fetch("/api/teachers"),
          ])

        if (!orgResponse.ok) {
          throw new Error("Failed to fetch organizations")
        }

        const organizationsData = (await orgResponse.json()) as Organization[]
        setOrganizations(organizationsData)

        if (schoolResponse.ok) {
          const schoolsData = (await schoolResponse.json()) as School[]
          setSchools(schoolsData)
        }

        if (teacherResponse.ok) {
          const teachersData = (await teacherResponse.json()) as Teacher[]
          setTeachers(teachersData)
        }
      } catch (error) {
        console.error(error)
        alert("Failed to load organizations")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const organizationsWithCounts = useMemo<OrganizationWithCounts[]>(() => {
    return organizations.map((org) => {
      const schoolCount = schools.filter((s) => s.org === org.id).length
      const teacherCount = teachers.filter((t) => t.org === org.id).length

      return {
        ...org,
        schoolCount,
        teacherCount,
      }
    })
  }, [organizations, schools, teachers])

  const filteredOrganizations = useMemo(() => {
    const searchLower = searchTerm.toLowerCase()

    const filtered = organizationsWithCounts.filter((org) => {
      return (
        toSearchableText(org.id).includes(searchLower) ||
        toSearchableText(org.title).includes(searchLower) ||
        toSearchableText(org.short_title).includes(searchLower) ||
        toSearchableText(org.remark).includes(searchLower) ||
        toSearchableText(org.type).includes(searchLower) ||
        toSearchableText(org.ethnicity).includes(searchLower)
      )
    })

    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      const multiplier = sortDirection === "asc" ? 1 : -1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * multiplier
      }

      return ((aValue || 0) > (bValue || 0) ? 1 : -1) * multiplier
    })

    return filtered
  }, [organizationsWithCounts, searchTerm, sortField, sortDirection])

  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage)
  const paginatedOrganizations = filteredOrganizations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDelete = (id: string) => {
    setOrganizationToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!organizationToDelete) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(
        `/api/organizations/${organizationToDelete}`,
        {
          method: "DELETE",
        },
      )

      if (!response.ok) {
        throw new Error("Failed to delete organization")
      }

      setOrganizations((prev) =>
        prev.filter((org) => org.id !== organizationToDelete),
      )
      setShowDeleteModal(false)
      setOrganizationToDelete(null)
    } catch (error) {
      console.error(error)
      alert("Failed to delete organization")
    } finally {
      setIsDeleting(false)
    }
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg
          className="ml-1 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      )
    }

    return sortDirection === "asc" ? (
      <svg
        className="ml-1 h-4 w-4 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="ml-1 h-4 w-4 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
          <p>Loading organizations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Organizations" />

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Organizations
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage organizations from Supabase
            </p>
          </div>
          <Link href="/organizations/add">
            <Button className="inline-flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Organization
            </Button>
          </Link>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow className="border-b border-gray-100 dark:border-gray-800">
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  ID
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex cursor-pointer items-center"
                    onClick={() => handleSort("title")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSort("title")}
                  >
                    Title
                    {renderSortIcon("title")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex cursor-pointer items-center"
                    onClick={() => handleSort("short_title")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("short_title")
                    }
                  >
                    Short Title
                    {renderSortIcon("short_title")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex cursor-pointer items-center"
                    onClick={() => handleSort("type")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSort("type")}
                  >
                    Type
                    {renderSortIcon("type")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex cursor-pointer items-center"
                    onClick={() => handleSort("ethnicity")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("ethnicity")
                    }
                  >
                    Ethnicity
                    {renderSortIcon("ethnicity")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Remark
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Schools
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Teachers
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedOrganizations.length === 0 && (
                <TableRow>
                  <TableCell
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={9}
                  >
                    {searchTerm
                      ? "No organizations match your search."
                      : "No organizations found. Add one to get started."}
                  </TableCell>
                </TableRow>
              )}
              {paginatedOrganizations.map((org) => (
                <TableRow
                  key={org.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <TableCell className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                    {org.id}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                    {org.title || "-"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {org.short_title || "-"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {org.type || "-"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {org.ethnicity || "-"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {org.remark || "-"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {org.schoolCount}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {org.teacherCount}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/organizations/edit/${org.id}`}>
                        <button className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(org.id)}
                        className="rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredOrganizations.length,
              )}{" "}
              of {filteredOrganizations.length} results
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Delete Organization
            </h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this organization? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
