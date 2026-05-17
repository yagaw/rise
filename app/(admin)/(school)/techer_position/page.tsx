"use client"
import React, { useEffect, useMemo, useState } from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AngleDownIcon, AngleUpIcon, PencilIcon, TrashBinIcon } from "@/icons"
import Button from "@/components/ui/button/Button"

interface Position {
  id: string
  created_at?: string
  type_english: string
  type_short?: string
  type_myanmar?: string
}

type SortField = keyof Position
type SortDirection = "asc" | "desc"

interface SortConfig {
  field: SortField | null
  direction: SortDirection
}

export default function TecherPositionPage() {
  const [rows, setRows] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: "asc",
  })
  const itemsPerPage = 10

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const response = await fetch("/api/techer_position")
        if (!response.ok) throw new Error("Failed to fetch Teacher Positions")
        const data = (await response.json()) as Position[]
        setRows(data)
      } catch (error) {
        console.error(error)
        alert("Failed to load Teacher Positions")
      } finally {
        setLoading(false)
      }
    }
    fetchRows()
  }, [])

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase()
    const items = rows.filter(
      (r) =>
        r.type_english.toLowerCase().includes(q) ||
        (r.type_short || "").toLowerCase().includes(q) ||
        (r.type_myanmar || "").toLowerCase().includes(q),
    )
    if (sortConfig.field) {
      items.sort((a, b) => {
        const aV = (a as unknown as Record<string, unknown>)[sortConfig.field!]
        const bV = (b as unknown as Record<string, unknown>)[sortConfig.field!]
        if (aV == null) return 1
        if (bV == null) return -1
        if (aV < bV) return sortConfig.direction === "asc" ? -1 : 1
        if (aV > bV) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }
    return items
  }, [rows, searchTerm, sortConfig])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length)
  const currentItems = filtered.slice(startIndex, endIndex)

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this Teacher Position?")) return
    try {
      const response = await fetch(`/api/techer_position/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete")
      setRows((prev) => prev.filter((r) => r.id !== id))
    } catch (error) {
      console.error(error)
      alert("Failed to delete Teacher Position")
    }
  }

  const renderSortIcon = (field: SortField) => {
    if (sortConfig.field !== field)
      return <span className="ml-1 inline-block text-gray-400"><AngleDownIcon /></span>
    return sortConfig.direction === "asc"
      ? <span className="ml-1 inline-block"><AngleUpIcon /></span>
      : <span className="ml-1 inline-block"><AngleDownIcon /></span>
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Teacher Positions" />
      <div className="rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder="Search positions..."
              className="h-10 w-full max-w-md rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
          <Link href="/techer_position/add">
            <Button size="sm" className="whitespace-nowrap">+ Add Position</Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow className="border-b border-gray-100 dark:border-gray-800">
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort("type_english")}>
                    Type (English){renderSortIcon("type_english")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Short</TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type (Myanmar)</TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!loading && currentItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No Teacher Positions found.
                  </TableCell>
                </TableRow>
              )}
              {!loading && currentItems.map((r) => (
                <TableRow key={r.id} className="transition hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {r.type_english}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {r.type_short || "-"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {r.type_myanmar || "-"}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/techer_position/edit/${r.id}`}>
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

        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Showing {filtered.length === 0 ? 0 : startIndex + 1} to {endIndex} of {filtered.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? "bg-brand-500 text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
