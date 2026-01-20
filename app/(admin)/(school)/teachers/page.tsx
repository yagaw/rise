"use client"
import React, { useState, useMemo } from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import SettingsButtons from "@/components/common/SettingsButtons"
import Link from "next/link"
import { Teacher } from "@/types/teacher"
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
const mockTeachers: Teacher[] = [
  {
    id: "1",
    teach_id: "T001",
    teach_name_eng: "Aung Kyaw",
    teach_name_bur: "အောင်ကျော်",
    sch_code: "SCH001",
    sch_name_eng: "Central High School",
    gender: "Male",
    yob: 1985,
    position: "Senior Teacher",
    status: "stay",
    edu_level: "Bachelor's Degree",
    teach_exp_year: 15,
    english: true,
    math: true,
    grade_9: true,
    grade_10: true,
  },
  {
    id: "2",
    teach_id: "T002",
    teach_name_eng: "Hnin Wai",
    teach_name_bur: "နှင်းဝေ",
    sch_code: "SCH002",
    sch_name_eng: "Riverside Primary School",
    gender: "Female",
    yob: 1990,
    position: "Teacher",
    status: "stay",
    edu_level: "Master's Degree",
    teach_exp_year: 10,
    burmese: true,
    history: true,
    grade_7: true,
    grade_8: true,
  },
  {
    id: "3",
    teach_id: "T003",
    teach_name_eng: "Zaw Min",
    teach_name_bur: "ဇော်မင်း",
    sch_code: "SCH001",
    sch_name_eng: "Central High School",
    gender: "Male",
    yob: 1988,
    position: "Head Teacher",
    status: "stay",
    edu_level: "Master's Degree",
    teach_exp_year: 12,
    science: true,
    phy: true,
    grade_11: true,
    grade_12: true,
  },
]

type SortField = keyof Teacher
type SortDirection = "asc" | "desc"

interface SortConfig {
  field: SortField | null
  direction: SortDirection
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers)
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

  // Filtered and sorted teachers
  const filteredTeachers = useMemo(() => {
    let filtered = teachers.filter((teacher) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        teacher.teach_id?.toLowerCase().includes(searchLower) ||
        teacher.teach_name_eng?.toLowerCase().includes(searchLower) ||
        teacher.teach_name_bur?.toLowerCase().includes(searchLower) ||
        teacher.sch_name_eng?.toLowerCase().includes(searchLower) ||
        teacher.sch_code?.toLowerCase().includes(searchLower)
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
  }, [teachers, searchTerm, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTeachers.length)
  const currentTeachers = filteredTeachers.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      setTeachers(teachers.filter((teacher) => teacher.id !== id))
      // TODO: Add API call to delete teacher
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

  const calculateAge = (yob?: number) => {
    if (!yob) return "N/A"
    return new Date().getFullYear() - yob
  }

  return (
    <div>
      <SettingsButtons />
      <PageBreadcrumb pageTitle="Teachers" />

      <div className="rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Header with Search and Add Button */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full max-w-md rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
          <Link href="/teachers/add">
            <Button size="sm" className="whitespace-nowrap">
              + Add Teacher
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
                    onClick={() => handleSort("teach_id")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("teach_id")
                    }
                  >
                    Teacher ID
                    {renderSortIcon("teach_id")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("teach_name_eng")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSort("teach_name_eng")
                    }
                  >
                    Teacher Name (English)
                    {renderSortIcon("teach_name_eng")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Teacher Name (Burmese)
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  School
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Gender
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Age
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Position
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("status")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSort("status")}
                  >
                    Status
                    {renderSortIcon("status")}
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Experience
                </TableCell>
                <TableCell className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
              {currentTeachers.map((teacher) => (
                <TableRow
                  key={teacher.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {teacher.teach_id}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {teacher.teach_name_eng}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {teacher.teach_name_bur}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    <div>
                      <div>{teacher.sch_name_eng}</div>
                      <div className="text-xs text-gray-500">
                        {teacher.sch_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {teacher.gender}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {calculateAge(teacher.yob)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {teacher.position}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        teacher.status === "stay"
                          ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                          : teacher.status === "new"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                            : teacher.status === "transfer_from" ||
                                teacher.status === "transfer_to"
                              ? "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {teacher.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-400">
                    {teacher.teach_exp_year
                      ? `${teacher.teach_exp_year} years`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/teachers/edit/${teacher.id}`}>
                        <button className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500">
                          <PencilIcon />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(teacher.id)}
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
            Showing {startIndex + 1} to {endIndex} of {filteredTeachers.length}{" "}
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
