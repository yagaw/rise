"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Organization } from "@/types/organization"
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
import { schools } from "@/data/education"
import { teachers } from "@/data/education"

// Mock data for organizations
const mockOrganizations: Organization[] = [
  {
    id: "SEE",
    name: "SEE",
    longname: "Save the Earth and Education",
    remark: "Education organization",
    created_at: new Date().toISOString(),
  },
  {
    id: "STF",
    name: "STF",
    longname: "Save the Future",
    remark: "Education organization",
    created_at: new Date().toISOString(),
  },
  {
    id: "KTWG",
    name: "KTWG",
    longname: "Karen Teacher Working Group",
    remark: "Education organization",
    created_at: new Date().toISOString(),
  },
  {
    id: "SENG",
    name: "SENG",
    longname: "SENG Organization",
    remark: "Education organization",
    created_at: new Date().toISOString(),
  },
  {
    id: "TEI",
    name: "TEI",
    longname: "Teacher Education Initiative",
    remark: "Education organization",
    created_at: new Date().toISOString(),
  },
  {
    id: "CDN",
    name: "CDN",
    longname: "Community Development Network",
    remark: "Education organization",
    created_at: new Date().toISOString(),
  },
  {
    id: "BF",
    name: "BF",
    longname: "Border Foundation",
    remark: "Education organization",
    created_at: new Date().toISOString(),
  },
  {
    id: "CRED",
    name: "CRED",
    longname: "Community Resource and Education Development",
    remark: "Education organization",
    created_at: new Date().toISOString(),
  },
  {
    id: "DDI",
    name: "DDI",
    longname: "Development and Democracy Initiative",
    remark: "Education organization",
    created_at: new Date().toISOString(),
  },
  {
    id: "ENDO",
    name: "ENDO",
    longname: "Education Network Development Organization",
    remark: "Education organization",
    created_at: new Date().toISOString(),
  },
  {
    id: "LHM",
    name: "LHM",
    longname: "Learning and Hope Mission",
    remark: "Education organization",
    created_at: new Date().toISOString(),
  },
  {
    id: "LDN",
    name: "LDN",
    longname: "Learning and Development Network",
    remark: "Education organization",
    created_at: new Date().toISOString(),
  },
  {
    id: "TSYU",
    name: "TSYU",
    longname: "Teacher Support and Youth Upliftment",
    remark: "Education organization",
    created_at: new Date().toISOString(),
  },
]

type SortField = "name" | "longname" | "schoolCount" | "teacherCount"
type SortDirection = "asc" | "desc"

export default function OrganizationsPage() {
  const [organizations, setOrganizations] =
    useState<Organization[]>(mockOrganizations)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [organizationToDelete, setOrganizationToDelete] = useState<
    string | null
  >(null)
  const itemsPerPage = 10

  // Calculate school and teacher counts for each organization
  const organizationsWithCounts = useMemo(() => {
    return organizations.map((org) => {
      const schoolCount = schools.filter((s) => s.org === org.id).length
      const teacherCount = teachers.filter((t) => t.org === org.id).length
      return { ...org, schoolCount, teacherCount }
    })
  }, [organizations])

  // Filter and sort
  const filteredOrganizations = useMemo(() => {
    let filtered = organizationsWithCounts.filter((org) =>
      Object.values(org).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )

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

  // Pagination
  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage)
  const paginatedOrganizations = filteredOrganizations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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

  const confirmDelete = () => {
    if (organizationToDelete) {
      setOrganizations(
        organizations.filter((org) => org.id !== organizationToDelete)
      )
      setShowDeleteModal(false)
      setOrganizationToDelete(null)
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
              Manage education organizations and view their relationships
            </p>
          </div>
          <Link href="/organizations/add">
            <Button className="inline-flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Organization
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow className="border-b border-gray-100 dark:border-gray-800">
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("name")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSort("name")}
                  >
                    Name
                    {renderSortIcon("name")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("longname")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("longname")
                    }
                  >
                    Long Name
                    {renderSortIcon("longname")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Remark
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("schoolCount")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("schoolCount")
                    }
                  >
                    Schools
                    {renderSortIcon("schoolCount")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("teacherCount")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("teacherCount")
                    }
                  >
                    Teachers
                    {renderSortIcon("teacherCount")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedOrganizations.map((org) => (
                <TableRow
                  key={org.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <TableCell className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                    {org.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {org.longname}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredOrganizations.length
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

      {/* Delete Confirmation Modal */}
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
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
