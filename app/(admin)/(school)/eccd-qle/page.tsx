"use client"

import { useEffect, useMemo, useState } from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import SettingsButtons from "@/components/common/SettingsButtons"
import Button from "@/components/ui/button/Button"
import type { DataYear } from "@/types/dataYear"

type ExcelCell = string | number | boolean | null
type ExcelRow = Record<string, ExcelCell>

type ExcelFile = {
  id: string
  name?: string
  url?: string
}

type LoadResponse = {
  excelFile?: ExcelFile
  excelFiles?: ExcelFile[]
  columns?: string[]
  rows?: ExcelRow[]
  error?: string
}

type SaveResponse = {
  success?: boolean
  columns?: string[]
  rows?: ExcelRow[]
  error?: string
}

type EccdQleFilter = {
  key: string
  label: string
  candidates: string[]
}

type AvailableEccdQleFilter = EccdQleFilter & {
  column: string
}

const FILTER_FIELDS = [
  {
    key: "organization",
    label: "Organization",
    candidates: ["organization", "org"],
  },
  {
    key: "school_name",
    label: "School name",
    candidates: ["school_name", "sch_name_eng", "sch_name", "school"],
  },
  {
    key: "sr_eng_mimu",
    label: "SR",
    candidates: ["sr_eng_mimu", "sr_eng_minu"],
  },
  {
    key: "ts_eng_mimu",
    label: "Township",
    candidates: ["ts_eng_mimu"],
  },
  {
    key: "school_type",
    label: "School type",
    candidates: ["sch_type", "school_type", "type"],
  },
] satisfies EccdQleFilter[]

function toDataYearId(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value)
}

function getCellText(value: ExcelCell) {
  if (value === null || value === undefined) return ""
  return String(value)
}

function rowMatchesSearch(row: ExcelRow, columns: string[], searchTerm: string) {
  const query = searchTerm.trim().toLowerCase()

  if (!query) return true

  return columns.some((column) =>
    getCellText(row[column]).toLowerCase().includes(query),
  )
}

function findColumn(columns: string[], candidates: string[]) {
  const normalizedColumns = new Map(
    columns.map((column) => [column.trim().toLowerCase(), column]),
  )

  for (const candidate of candidates) {
    const found = normalizedColumns.get(candidate.toLowerCase())

    if (found) return found
  }

  return null
}

export default function EccdQlePage() {
  const [dataYears, setDataYears] = useState<DataYear[]>([])
  const [selectedDataYear, setSelectedDataYear] = useState("")
  const [loadingYears, setLoadingYears] = useState(true)
  const [loadingExcelFiles, setLoadingExcelFiles] = useState(false)
  const [loadingEccdQle, setLoadingEccdQle] =
    useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [excelFile, setExcelFile] = useState<ExcelFile | null>(null)
  const [excelFiles, setExcelFiles] = useState<ExcelFile[]>([])
  const [selectedExcelFileId, setSelectedExcelFileId] = useState("")
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<ExcelRow[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >({})
  const [currentPage, setCurrentPage] = useState(1)
  const [rowEditorOpen, setRowEditorOpen] = useState(false)
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null)
  const [draftRow, setDraftRow] = useState<ExcelRow>({})

  const itemsPerPage = 25

  useEffect(() => {
    const loadDataYears = async () => {
      try {
        const response = await fetch("/api/data_year")

        if (!response.ok) {
          throw new Error("Failed to load data years")
        }

        const data = (await response.json()) as DataYear[]
        setDataYears(data)
      } catch (loadError) {
        console.error(loadError)
        setError("Failed to load data years.")
      } finally {
        setLoadingYears(false)
      }
    }

    loadDataYears()
  }, [])

  useEffect(() => {
    if (!selectedDataYear) {
      setExcelFiles([])
      setSelectedExcelFileId("")
      return
    }

    const loadExcelFiles = async () => {
      setLoadingExcelFiles(true)
      setError("")

      try {
        const params = new URLSearchParams({
          data_year: selectedDataYear,
          list: "1",
        })
        const response = await fetch(
          `/api/eccd-qle/excel?${params.toString()}`,
        )
        const body = (await response.json()) as LoadResponse

        if (!response.ok) {
          throw new Error(
            body.error || "Failed to load ECCD QLE Excel files.",
          )
        }

        const nextExcelFiles = body.excelFiles ?? []
        setExcelFiles(nextExcelFiles)
        setSelectedExcelFileId(
          nextExcelFiles.length > 0 ? String(nextExcelFiles[0].id) : "",
        )
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load ECCD QLE Excel files."
        setExcelFiles([])
        setSelectedExcelFileId("")
        setError(message)
      } finally {
        setLoadingExcelFiles(false)
      }
    }

    loadExcelFiles()
  }, [selectedDataYear])

  const selectedDataYearLabel = useMemo(() => {
    const found = dataYears.find(
      (dataYear) => toDataYearId(dataYear.id) === selectedDataYear,
    )

    return found?.title || selectedDataYear
  }, [dataYears, selectedDataYear])

  const availableFilters = useMemo(() => {
    const filters: AvailableEccdQleFilter[] = []

    FILTER_FIELDS.forEach((filter) => {
      const column = findColumn(columns, filter.candidates)

      if (column) {
        filters.push({ ...filter, column })
      }
    })

    return filters
  }, [columns])

  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {}

    availableFilters.forEach((filter) => {
      const values = new Set<string>()

      rows.forEach((row) => {
        const value = getCellText(row[filter.column]).trim()

        if (value) {
          values.add(value)
        }
      })

      options[filter.key] = Array.from(values).sort((a, b) =>
        a.localeCompare(b),
      )
    })

    return options
  }, [availableFilters, rows])

  const filteredRows = useMemo(
    () =>
      rows
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => {
          const matchesFilters = availableFilters.every((filter) => {
            const selectedValue = selectedFilters[filter.key]

            if (!selectedValue) return true

            return getCellText(row[filter.column]) === selectedValue
          })

          return matchesFilters && rowMatchesSearch(row, columns, searchTerm)
        }),
    [availableFilters, columns, rows, searchTerm, selectedFilters],
  )

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRows.length)
  const visibleRows = filteredRows.slice(startIndex, endIndex)

  const clearWorkbook = () => {
    setExcelFile(null)
    setColumns([])
    setRows([])
    setSearchTerm("")
    setSelectedFilters({})
    setCurrentPage(1)
    setRowEditorOpen(false)
    setEditingRowIndex(null)
    setDraftRow({})
  }

  const handleSelectDataYear = (value: string) => {
    setSelectedDataYear(value)
    setExcelFiles([])
    setSelectedExcelFileId("")
    setError("")
    setSuccessMessage("")
    clearWorkbook()
  }

  const handleLoadEccdQle = async () => {
    if (!selectedDataYear) {
      setError("Select a data year first.")
      return
    }

    if (!selectedExcelFileId) {
      setError("Select data first.")
      return
    }

    setLoadingEccdQle(true)
    setError("")
    setSuccessMessage("")
    clearWorkbook()

    try {
      const params = new URLSearchParams({
        data_year: selectedDataYear,
        excel_file_id: selectedExcelFileId,
      })
      const response = await fetch(`/api/eccd-qle/excel?${params.toString()}`)
      const body = (await response.json()) as LoadResponse

      if (!response.ok) {
        throw new Error(body.error || "Failed to load ECCD QLE Excel file.")
      }

      setExcelFile(body.excelFile ?? null)
      setColumns(body.columns ?? [])
      setRows(body.rows ?? [])
      setCurrentPage(1)
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load ECCD QLE Excel file."
      setError(message)
    } finally {
      setLoadingEccdQle(false)
    }
  }

  const buildEmptyRow = () =>
    columns.reduce<ExcelRow>((row, column) => {
      row[column] = ""
      return row
    }, {})

  const openAddRowEditor = () => {
    setEditingRowIndex(null)
    setDraftRow(buildEmptyRow())
    setRowEditorOpen(true)
    setError("")
  }

  const openEditRowEditor = (rowIndex: number) => {
    setEditingRowIndex(rowIndex)
    setDraftRow({ ...rows[rowIndex] })
    setRowEditorOpen(true)
    setError("")
  }

  const closeRowEditor = () => {
    setRowEditorOpen(false)
    setEditingRowIndex(null)
    setDraftRow({})
  }

  const handleDraftChange = (column: string, value: string) => {
    setDraftRow((currentDraft) => ({ ...currentDraft, [column]: value }))
    setSuccessMessage("")
  }

  const handleFilterChange = (filterKey: string, value: string) => {
    setSelectedFilters((currentFilters) => ({
      ...currentFilters,
      [filterKey]: value,
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSelectedFilters({})
    setSearchTerm("")
    setCurrentPage(1)
  }

  const handleSubmitRowEditor = () => {
    const normalizedDraft = columns.reduce<ExcelRow>((row, column) => {
      row[column] = draftRow[column] ?? ""
      return row
    }, {})

    if (editingRowIndex === null) {
      const nextLength = rows.length + 1

      setRows((currentRows) => [...currentRows, normalizedDraft])
      setCurrentPage(Math.max(1, Math.ceil(nextLength / itemsPerPage)))
    } else {
      setRows((currentRows) =>
        currentRows.map((row, index) =>
          index === editingRowIndex ? normalizedDraft : row,
        ),
      )
    }

    setSuccessMessage("")
    closeRowEditor()
  }

  const handleSave = async () => {
    if (!excelFile?.id) {
      setError("Load an ECCD QLE Excel file before saving.")
      return
    }

    setSaving(true)
    setError("")
    setSuccessMessage("")

    try {
      const response = await fetch("/api/eccd-qle/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          excelFileId: excelFile.id,
          columns,
          rows,
        }),
      })
      const body = (await response.json()) as SaveResponse

      if (!response.ok) {
        throw new Error(body.error || "Failed to save ECCD QLE Excel file.")
      }

      setColumns(body.columns ?? columns)
      setRows(body.rows ?? rows)
      setSuccessMessage("ECCD QLE Excel file saved.")
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Failed to save ECCD QLE Excel file."
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-w-0">
      <SettingsButtons />
      <PageBreadcrumb pageTitle="ECCD QLE" />

      <div className="min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <div>
              <label
                htmlFor="data_year"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Select data year
              </label>
              <select
                id="data_year"
                value={selectedDataYear}
                onChange={(event) => handleSelectDataYear(event.target.value)}
                disabled={loadingYears}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 lg:max-w-md"
              >
                <option value="" className="dark:bg-gray-900">
                  {loadingYears ? "Loading data years..." : "Choose data year"}
                </option>
                {dataYears.map((dataYear) => (
                  <option
                    key={toDataYearId(dataYear.id)}
                    value={toDataYearId(dataYear.id)}
                    className="dark:bg-gray-900"
                  >
                    {dataYear.title || toDataYearId(dataYear.id)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="excel_data"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Data
              </label>
              <select
                id="excel_data"
                value={selectedExcelFileId}
                onChange={(event) => {
                  setSelectedExcelFileId(event.target.value)
                  setError("")
                  setSuccessMessage("")
                  clearWorkbook()
                }}
                disabled={!selectedDataYear || loadingExcelFiles}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="" className="dark:bg-gray-900">
                  {loadingExcelFiles
                    ? "Loading data..."
                    : selectedDataYear
                      ? "Select data"
                      : "Select data year first"}
                </option>
                {excelFiles.map((item) => (
                  <option
                    key={String(item.id)}
                    value={String(item.id)}
                    className="dark:bg-gray-900"
                  >
                    {item.name || String(item.id)}
                  </option>
                ))}
              </select>
            </div>

            <Button
              size="sm"
              onClick={handleLoadEccdQle}
              disabled={!selectedDataYear || !selectedExcelFileId || loadingEccdQle}
              isLoading={loadingEccdQle}
              className="h-11 whitespace-nowrap"
            >
              Load ECCD QLE
            </Button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-5 rounded-lg border border-error-300 bg-error-50 p-4 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mx-5 mt-5 rounded-lg border border-success-300 bg-success-50 p-4 text-sm text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400">
            {successMessage}
          </div>
        )}

        {!excelFile && (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select a data year and data record to load the ECCD QLE Excel
              file.
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              ECCD QLE data uses excel_data records with data_type 7
              by default.
            </p>
          </div>
        )}

        {excelFile && (
          <>
            <div className="flex flex-col gap-4 border-b border-gray-100 p-4 dark:border-gray-800 sm:p-5">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  {excelFile.name || "ECCD QLE Excel File"}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Data year: {selectedDataYearLabel} | Rows: {rows.length}
                </p>
              </div>

              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <input
                  type="text"
                  placeholder="Search Excel rows..."
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 sm:w-80"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openAddRowEditor}
                  className="w-full sm:w-auto"
                >
                  Add Row
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  isLoading={saving}
                  className="w-full sm:w-auto"
                >
                  Save Excel
                </Button>
              </div>

              {availableFilters.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {availableFilters.map((filter) => (
                    <div key={filter.key} className="min-w-0">
                      <label
                        htmlFor={`eccd-qle-filter-${filter.key}`}
                        className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400"
                      >
                        {filter.label}
                      </label>
                      <select
                        id={`eccd-qle-filter-${filter.key}`}
                        value={selectedFilters[filter.key] ?? ""}
                        onChange={(event) =>
                          handleFilterChange(filter.key, event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                      >
                        <option value="" className="dark:bg-gray-900">
                          All {filter.label}
                        </option>
                        {(filterOptions[filter.key] ?? []).map((option) => (
                          <option
                            key={option}
                            value={option}
                            className="dark:bg-gray-900"
                          >
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {(searchTerm || Object.values(selectedFilters).some(Boolean)) && (
                <div>
                  <Button size="sm" variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            <div className="custom-scrollbar max-w-full overflow-x-auto">
              <table className="w-max min-w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="bg-gray-50 px-4 py-3 text-xs font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400 lg:sticky lg:left-0 lg:z-10">
                      #
                    </th>
                    <th className="bg-gray-50 px-4 py-3 text-xs font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400 lg:sticky lg:left-12 lg:z-10">
                      Actions
                    </th>
                    {columns.map((column) => (
                      <th
                        key={column}
                        className="min-w-40 border-b border-gray-100 px-3 py-3 text-xs font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400 sm:min-w-48"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {visibleRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={columns.length + 2}
                        className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No rows found.
                      </td>
                    </tr>
                  )}

                  {visibleRows.map(({ row, index }) => (
                    <tr
                      key={index}
                      className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <td className="bg-white px-4 py-2 text-xs text-gray-400 dark:bg-gray-900 lg:sticky lg:left-0 lg:z-10">
                        {index + 1}
                      </td>
                      <td className="bg-white px-4 py-2 dark:bg-gray-900 lg:sticky lg:left-12 lg:z-10">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditRowEditor(index)}
                        >
                          Edit
                        </Button>
                      </td>
                      {columns.map((column) => (
                        <td
                          key={column}
                          className="max-w-56 truncate px-3 py-3 text-sm text-gray-700 dark:text-gray-300 sm:max-w-72"
                          title={getCellText(row[column])}
                        >
                          {getCellText(row[column]) || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Showing {filteredRows.length ? startIndex + 1 : 0} to {endIndex}{" "}
                of {filteredRows.length} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {rowEditorOpen && (
        <div className="fixed inset-0 z-99999 overflow-y-auto bg-gray-400/50 px-3 py-4 backdrop-blur-[20px] sm:px-5 sm:py-6">
          <div className="mx-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900 lg:max-h-[calc(100dvh-3rem)] lg:max-w-5xl">
            <div className="relative shrink-0 border-b border-gray-100 px-5 py-4 pr-16 dark:border-gray-800 sm:px-6 sm:py-5">
              <button
                type="button"
                onClick={closeRowEditor}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                aria-label="Close row editor"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {editingRowIndex === null
                  ? "Add ECCD QLE Row"
                  : "Edit ECCD QLE Row"}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update the Excel fields, then save the row. Use Save Excel on
                the main page to write changes back to storage.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6">
              <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
                {columns.map((column) => (
                  <div key={column}>
                    <label
                      htmlFor={`row-field-${column}`}
                      className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {column}
                    </label>
                    <input
                      id={`row-field-${column}`}
                      value={getCellText(draftRow[column])}
                      onChange={(event) =>
                        handleDraftChange(column, event.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 sm:px-6 sm:py-4">
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={closeRowEditor}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitRowEditor}>
                  {editingRowIndex === null ? "Add Row" : "Save Row"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
