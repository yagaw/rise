"use client"
import React, { useState, useMemo } from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Link from "next/link"
import { School } from "@/types/school"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AngleDownIcon, AngleUpIcon, PencilIcon, TrashBinIcon } from "@/icons"
import Button from "@/components/ui/button/Button"

// Mock data - replace with actual API call
const mockSchools: School[] = [
  {
    id: "1",
    sch_code: "SCH001",
    sch_name_eng: "Central High School",
    sch_name_bur: "ဗဟိုအထက်တန်းကျောင်း",
    sr_eng_mimu: "Yangon",
    dist_eng_mimu: "Yangon East",
    ts_eng_mimu: "Dagon",
    sch_status: "Active",
    sch_type: "Government",
    sch_estd_year: 1990,
    stu_female_tt: 250,
    stu_male_tt: 280,
    joined_rise: true,
  },
  {
    id: "2",
    sch_code: "SCH002",
    sch_name_eng: "Riverside Primary School",
    sch_name_bur: "မြစ်ကမ်းစာကျောင်း",
    sr_eng_mimu: "Mandalay",
    dist_eng_mimu: "Mandalay",
    ts_eng_mimu: "Aung Myay Thar Zan",
    sch_status: "Active",
    sch_type: "Private",
    sch_estd_year: 2005,
    stu_female_tt: 150,
    stu_male_tt: 170,
    joined_rise: true,
  },
  {
    id: "3",
    sch_code: "SCH003",
    sch_name_eng: "Mountain View School",
    sch_name_bur: "တောင်မြင်ကွင်းကျောင်း",
    sr_eng_mimu: "Shan",
    dist_eng_mimu: "Taunggyi",
    ts_eng_mimu: "Taunggyi",
    sch_status: "Active",
    sch_type: "Government",
    sch_estd_year: 1985,
    stu_female_tt: 180,
    stu_male_tt: 200,
    joined_rise: false,
  },
]

type SortField = keyof School
type SortDirection = "asc" | "desc"

interface SortConfig {
  field: SortField | null
  direction: SortDirection
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>(mockSchools)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: "asc",
  })
  const itemsPerPage = 10

  // Sort function
  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Filtered and sorted schools
  const filteredSchools = useMemo(() => {
    let filtered = schools.filter((school) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        school.sch_code?.toLowerCase().includes(searchLower) ||
        school.sch_name_eng?.toLowerCase().includes(searchLower) ||
        school.sch_name_bur?.toLowerCase().includes(searchLower) ||
        school.dist_eng_mimu?.toLowerCase().includes(searchLower) ||
        school.sr_eng_mimu?.toLowerCase().includes(searchLower)
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
  }, [schools, searchTerm, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredSchools.length)
  const currentSchools = filteredSchools.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this school?")) {
      setSchools(schools.filter((school) => school.id !== id))
      // TODO: Add API call to delete school
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
      <PageBreadcrumb pageTitle="Schools" />

      <div className="rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Header with Search and Add Button */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full max-w-md rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
          <Link href="/schools/add">
            <Button size="sm" className="whitespace-nowrap">
              + Add School
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
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("sch_name_eng")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("sch_name_eng")
                    }
                  >
                    School Name (English)
                    {renderSortIcon("sch_name_eng")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  School Name (Burmese)
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("sr_eng_mimu")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("sr_eng_mimu")
                    }
                  >
                    State/Region
                    {renderSortIcon("sr_eng_mimu")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  District
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
                  Type
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Students
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
              {currentSchools.map((school) => (
                <TableRow
                  key={school.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {school.sch_code}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {school.sch_name_eng}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {school.sch_name_bur}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {school.sr_eng_mimu}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {school.dist_eng_mimu}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        school.sch_status === "Active"
                          ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {school.sch_status}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {school.sch_type}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {(school.stu_female_tt || 0) + (school.stu_male_tt || 0)}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/schools/edit/${school.id}`}>
                        <button className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500">
                          <PencilIcon />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(school.id)}
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
            Showing {startIndex + 1} to {endIndex} of {filteredSchools.length}{" "}
            entries
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
                )
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
