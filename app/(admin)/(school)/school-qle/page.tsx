"use client"
import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import SettingsButtons from "@/components/common/SettingsButtons"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AngleDownIcon, AngleUpIcon, PencilIcon, TrashBinIcon } from "@/icons"
import Button from "@/components/ui/button/Button"
import { SchoolQle } from "@/types/schoolQle"

type SortField = keyof SchoolQle
type SortDirection = "asc" | "desc"

interface SortConfig {
  field: SortField | null
  direction: SortDirection
}

const qleIndicators: Array<keyof SchoolQle> = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
]

function getQleTotal(row: SchoolQle) {
  return qleIndicators.reduce((sum, key) => {
    const value = row[key]
    return sum + (typeof value === "number" ? value : Number(value) || 0)
  }, 0)
}

export default function SchoolQlePage() {
  const [qleRows, setQleRows] = useState<SchoolQle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: "asc",
  })

  const itemsPerPage = 10

  useEffect(() => {
    const fetchQleRows = async () => {
      try {
        const response = await fetch("/api/school-qle")

        if (!response.ok) {
          throw new Error("Failed to fetch School QLE data")
        }

        const data = (await response.json()) as SchoolQle[]
        setQleRows(data)
      } catch (error) {
        console.error(error)
        alert("Failed to load School QLE data")
      } finally {
        setLoading(false)
      }
    }

    fetchQleRows()
  }, [])

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const filteredRows = useMemo(() => {
    const searchLower = searchTerm.toLowerCase()
    const filtered = qleRows.filter((row) => {
      return (
        row.sch_code?.toLowerCase().includes(searchLower) ||
        row.data_year?.toLowerCase().includes(searchLower) ||
        row.sch_name_eng?.toLowerCase().includes(searchLower) ||
        row.sr_eng_minu?.toLowerCase().includes(searchLower) ||
        row.ts_eng_mimu?.toLowerCase().includes(searchLower)
      )
    })

    if (sortConfig.field) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.field!]
        const bValue = b[sortConfig.field!]

        if (aValue === undefined || aValue === null) return 1
        if (bValue === undefined || bValue === null) return -1

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [qleRows, searchTerm, sortConfig])

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRows.length)
  const currentRows = filteredRows.slice(startIndex, endIndex)

  const averageScore = useMemo(() => {
    if (!qleRows.length) {
      return 0
    }

    const total = qleRows.reduce((sum, row) => sum + getQleTotal(row), 0)
    return total / qleRows.length
  }, [qleRows])

  const highestScore = useMemo(() => {
    if (!qleRows.length) {
      return 0
    }

    return Math.max(...qleRows.map((row) => getQleTotal(row)))
  }, [qleRows])

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this QLE record?")) {
      return
    }

    try {
      const response = await fetch(`/api/school-qle/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete QLE record")
      }

      setQleRows((prev) => prev.filter((row) => row.id !== id))
    } catch (error) {
      console.error(error)
      alert("Failed to delete QLE record")
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
      <PageBreadcrumb pageTitle="School QLE" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Total Records
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {qleRows.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Average QLE Score
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {averageScore.toFixed(1)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Highest QLE Score
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {highestScore}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <input
              type="text"
              placeholder="Search QLE records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full max-w-md rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            {searchTerm && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSearchTerm("")}
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredRows.length} result{filteredRows.length === 1 ? "" : "s"}
            </span>
            <Link href="/school-qle/add">
              <Button size="sm" className="whitespace-nowrap">
                + Add QLE Record
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow className="border-b border-gray-100 dark:border-gray-800">
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("sch_code")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("sch_code")
                    }
                  >
                    School Code
                    {renderSortIcon("sch_code")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Data Year
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("sch_name_eng")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("sch_name_eng")
                    }
                  >
                    School Name
                    {renderSortIcon("sch_name_eng")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  State/Region
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Township
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Type
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  QLE Score (A-S)
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading && (
                <TableRow>
                  <TableCell className="px-5 py-10 text-sm text-gray-500 dark:text-gray-400">
                    Loading QLE records...
                  </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                </TableRow>
              )}
              {!loading && currentRows.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-10 text-sm text-gray-500 dark:text-gray-400">
                    No QLE records found.
                  </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                </TableRow>
              )}
              {!loading &&
                currentRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {row.sch_code}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                      {row.data_year || "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                      {row.sch_name_eng}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                      {row.sr_eng_minu}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                      {row.ts_eng_mimu}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                      {row.sch_type}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                      <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                        {getQleTotal(row)}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/school-qle/edit/${row.id}`}>
                          <button className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500">
                            <PencilIcon />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(row.id)}
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

        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Showing {filteredRows.length ? startIndex + 1 : 0} to {endIndex} of{" "}
            {filteredRows.length} entries
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {totalPages ? currentPage : 0} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
