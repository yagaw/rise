"use client"
import React, { useEffect, useMemo, useState } from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import SettingsButtons from "@/components/common/SettingsButtons"
import Link from "next/link"
import { EccdStudent } from "@/types/eccdStudent"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AngleDownIcon, AngleUpIcon, PencilIcon, TrashBinIcon } from "@/icons"
import Button from "@/components/ui/button/Button"

type SortField = keyof EccdStudent
type SortDirection = "asc" | "desc"

interface SortConfig {
  field: SortField | null
  direction: SortDirection
}

export default function EccdListPage() {
  const [rows, setRows] = useState<EccdStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: "asc",
  })
  const itemsPerPage = 10

  useEffect(() => {
    const fetchEccdStudents = async () => {
      try {
        const response = await fetch("/api/eccd")

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string }
          throw new Error(errorData.error || "Failed to fetch ECCD students")
        }

        const data = (await response.json()) as EccdStudent[]
        setRows(data)
      } catch (error) {
        console.error(error)
        alert("Failed to load ECCD students")
      } finally {
        setLoading(false)
      }
    }

    fetchEccdStudents()
  }, [])

  // Sort function
  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Filtered and sorted rows
  const filteredRows = useMemo(() => {
    let filtered = rows.filter((r) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        r.std_name_eng?.toLowerCase().includes(searchLower) ||
        r.std_id?.toLowerCase().includes(searchLower) ||
        r.data_year?.toLowerCase().includes(searchLower) ||
        r.sch_name_eng?.toLowerCase().includes(searchLower) ||
        r.sch_code?.toLowerCase().includes(searchLower)
      )
    })

    // Apply sorting
    if (sortConfig.field) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.field!]
        const bValue = b[sortConfig.field!]

        if (aValue === undefined || aValue === null) return 1
        if (bValue === undefined || bValue === null) return -1

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [rows, searchTerm, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRows.length)
  const currentRows = filteredRows.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this ECCD record?")) {
      try {
        const response = await fetch(`/api/eccd/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string }
          throw new Error(errorData.error || "Failed to delete ECCD student")
        }

        setRows((prev) => prev.filter((r) => r.id !== id))
      } catch (error) {
        console.error(error)
        alert("Failed to delete ECCD student")
      }
    }
  }

  const renderSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return (
        <span className="ml-1 inline-block text-gray-400">
          <AngleDownIcon />
        </span>
      )
    }
    return sortConfig.direction === "asc" ? (
      <span className="ml-1 inline-block">
        <AngleUpIcon />
      </span>
    ) : (
      <span className="ml-1 inline-block">
        <AngleDownIcon />
      </span>
    )
  }

  return (
    <div>
      <SettingsButtons />
      <PageBreadcrumb pageTitle="ECCD Students" />

      <div className="rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Header with Search and Add Button */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, id, or school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full max-w-md rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
          <Link href="/eccd/add">
            <Button size="sm" className="whitespace-nowrap">
              + Add ECCD
            </Button>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow className="border-b border-gray-100 dark:border-gray-800">
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("std_id")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSort("std_id")}
                  >
                    Student ID
                    {renderSortIcon("std_id")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("std_name_eng")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("std_name_eng")
                    }
                  >
                    Name (English)
                    {renderSortIcon("std_name_eng")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Data Year
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Name (Burmese)
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  School
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("enroll_date")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("enroll_date")
                    }
                  >
                    Enrollment Date
                    {renderSortIcon("enroll_date")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Gender
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("sch_status")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("sch_status")
                    }
                  >
                    Status
                    {renderSortIcon("sch_status")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Loading ECCD students...
                  </TableCell>
                </TableRow>
              )}
              {!loading && currentRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No ECCD students found.
                  </TableCell>
                </TableRow>
              )}
              {currentRows.map((r) => (
                <TableRow
                  key={r.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {r.std_id}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {r.std_name_eng}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {r.data_year || "-"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {r.std_name_bur}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    <div>
                      <div>{r.sch_name_eng}</div>
                      <div className="text-xs text-gray-500">{r.sch_code}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {r.enroll_date}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {r.sex || "-"}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        r.sch_status === "Active"
                          ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {r.sch_status}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/eccd/edit/${r.id}`}>
                        <button className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500">
                          <PencilIcon />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500"
                      >
                        <TrashBinIcon />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Showing {filteredRows.length === 0 ? 0 : startIndex + 1} to{" "}
            {endIndex} of {filteredRows.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? "bg-brand-500 text-white"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
