"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import Link from "next/link"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import type { DataYear } from "@/types/dataYear"

type UploadResponse = {
  data?: unknown
  url?: string
  error?: string
}

type DataType = {
  id: string | number
  created_at?: string
  title?: string
  name?: string
  type?: string
  remark?: string
}

function toDataYearId(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value)
}

function toDataTypeId(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value)
}

function getDataTypeLabel(dataType: DataType) {
  return (
    dataType.title ||
    dataType.name ||
    dataType.type ||
    dataType.remark ||
    toDataTypeId(dataType.id)
  )
}

function isExcelFile(file: File) {
  const lowerName = file.name.toLowerCase()
  return lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")
}

async function parseUploadResponse(
  response: Response,
): Promise<UploadResponse> {
  const text = await response.text()

  if (!text) return {}

  try {
    return JSON.parse(text) as UploadResponse
  } catch {
    return {
      error: response.ok
        ? "Import completed, but the server returned an invalid response."
        : text,
    }
  }
}

export default function ImportPage() {
  const [name, setName] = useState("")
  const [dataYears, setDataYears] = useState<DataYear[]>([])
  const [selectedDataYear, setSelectedDataYear] = useState("")
  const [dataYearSearch, setDataYearSearch] = useState("")
  const [isDataYearOpen, setIsDataYearOpen] = useState(false)
  const dataYearRef = useRef<HTMLDivElement>(null)
  const [dataTypes, setDataTypes] = useState<DataType[]>([])
  const [selectedDataType, setSelectedDataType] = useState("")
  const [dataTypeSearch, setDataTypeSearch] = useState("")
  const [isDataTypeOpen, setIsDataTypeOpen] = useState(false)
  const dataTypeRef = useRef<HTMLDivElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successUrl, setSuccessUrl] = useState("")

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [dataYearResponse, dataTypeResponse] = await Promise.all([
          fetch("/api/data_year"),
          fetch("/api/data_type"),
        ])

        if (!dataYearResponse.ok) {
          throw new Error("Failed to load data years")
        }

        if (!dataTypeResponse.ok) {
          throw new Error("Failed to load data types")
        }

        const dataYearRows = (await dataYearResponse.json()) as DataYear[]
        const dataTypeRows = (await dataTypeResponse.json()) as DataType[]
        setDataYears(dataYearRows)
        setDataTypes(dataTypeRows)

        if (dataYearRows.length > 0) {
          setSelectedDataYear(
            (current) => current || toDataYearId(dataYearRows[0].id),
          )
        }

        if (dataTypeRows.length > 0) {
          setSelectedDataType(
            (current) => current || toDataTypeId(dataTypeRows[0].id),
          )
        }
      } catch (loadError) {
        console.error(loadError)
        setError("Failed to load data years or data types.")
      }
    }

    loadOptions()
  }, [])

  useEffect(() => {
    if (!isDataYearOpen && !isDataTypeOpen) return

    const handler = (event: MouseEvent) => {
      if (
        dataYearRef.current &&
        !dataYearRef.current.contains(event.target as Node)
      ) {
        setIsDataYearOpen(false)
      }

      if (
        dataTypeRef.current &&
        !dataTypeRef.current.contains(event.target as Node)
      ) {
        setIsDataTypeOpen(false)
      }
    }

    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isDataTypeOpen, isDataYearOpen])

  const selectedDataYearLabel = useMemo(() => {
    if (!selectedDataYear) return "Select data year"

    const found = dataYears.find(
      (dataYear) => toDataYearId(dataYear.id) === selectedDataYear,
    )

    return found?.title || toDataYearId(found?.id) || selectedDataYear
  }, [dataYears, selectedDataYear])

  const filteredDataYears = useMemo(() => {
    const query = dataYearSearch.trim().toLowerCase()

    if (!query) return dataYears

    return dataYears.filter((dataYear) => {
      const title = (dataYear.title || "").toLowerCase()
      const id = toDataYearId(dataYear.id).toLowerCase()
      return title.includes(query) || id.includes(query)
    })
  }, [dataYearSearch, dataYears])

  const selectedDataTypeLabel = useMemo(() => {
    if (!selectedDataType) return "Select data type"

    const found = dataTypes.find(
      (dataType) => toDataTypeId(dataType.id) === selectedDataType,
    )

    return found ? getDataTypeLabel(found) : selectedDataType
  }, [dataTypes, selectedDataType])

  const filteredDataTypes = useMemo(() => {
    const query = dataTypeSearch.trim().toLowerCase()

    if (!query) return dataTypes

    return dataTypes.filter((dataType) => {
      const id = toDataTypeId(dataType.id).toLowerCase()
      const label = getDataTypeLabel(dataType).toLowerCase()
      const remark = (dataType.remark || "").toLowerCase()

      return id.includes(query) || label.includes(query) || remark.includes(query)
    })
  }, [dataTypeSearch, dataTypes])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null
    setSuccessUrl("")
    setError("")

    if (!selectedFile) {
      setFile(null)
      return
    }

    if (!isExcelFile(selectedFile)) {
      setFile(null)
      setError("Only .xlsx and .xls files can be uploaded.")
      event.target.value = ""
      return
    }

    setFile(selectedFile)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!name.trim()) {
      setError("Enter a name for the Excel file.")
      return
    }

    if (!selectedDataYear) {
      setError("Select a data year.")
      return
    }

    if (!selectedDataType) {
      setError("Select a data type.")
      return
    }

    if (!file) {
      setError("Choose an Excel file.")
      return
    }

    const params = new URLSearchParams({
      name: name.trim(),
      dataYearId: selectedDataYear,
      dataTypeId: selectedDataType,
      fileName: file.name,
      fileType: file.type,
    })

    setIsSubmitting(true)
    setError("")
    setSuccessUrl("")

    try {
      const response = await fetch(
        `/api/excel_data/import?${params.toString()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        },
      )
      const body = await parseUploadResponse(response)

      if (!response.ok) {
        throw new Error(body.error || "Failed to import Excel file.")
      }

      setSuccessUrl(body.url || "")
      setFile(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to import Excel file."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Import Excel" />

      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Upload Excel File
            </h3>
            <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
              The file will be uploaded to the cloud storage and the metadata
              will be saved in the database.
            </p>
          </div>
          <Link
            href="/excel-data"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            Manage Excel Data
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div>
              <label
                htmlFor="excel_name"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Table name / Excel name
              </label>
              <input
                id="excel_name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setError("")
                  setSuccessUrl("")
                }}
                placeholder="Your Excel file name or table name in database"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data year
              </label>
              <div className="relative" ref={dataYearRef}>
                <button
                  type="button"
                  onClick={() => setIsDataYearOpen((open) => !open)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-left text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                >
                  {selectedDataYearLabel}
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    v
                  </span>
                </button>

                {isDataYearOpen && (
                  <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900">
                    <input
                      type="text"
                      placeholder="Search data year..."
                      className="mb-2 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      value={dataYearSearch}
                      onChange={(event) =>
                        setDataYearSearch(event.target.value)
                      }
                    />
                    <div className="max-h-56 overflow-y-auto">
                      {filteredDataYears.length > 0 ? (
                        filteredDataYears.map((item) => (
                          <button
                            key={toDataYearId(item.id)}
                            type="button"
                            onClick={() => {
                              setSelectedDataYear(toDataYearId(item.id))
                              setIsDataYearOpen(false)
                              setDataYearSearch("")
                              setError("")
                              setSuccessUrl("")
                            }}
                            className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 ${
                              selectedDataYear === toDataYearId(item.id)
                                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <span>{item.title || toDataYearId(item.id)}</span>
                            <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {toDataYearId(item.id)}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No data year found.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data Type
              </label>
              <div className="relative" ref={dataTypeRef}>
                <button
                  type="button"
                  onClick={() => setIsDataTypeOpen((open) => !open)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-left text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                >
                  {selectedDataTypeLabel}
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    v
                  </span>
                </button>

                {isDataTypeOpen && (
                  <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900">
                    <input
                      type="text"
                      placeholder="Search data type..."
                      className="mb-2 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      value={dataTypeSearch}
                      onChange={(event) =>
                        setDataTypeSearch(event.target.value)
                      }
                    />
                    <div className="max-h-56 overflow-y-auto">
                      {filteredDataTypes.length > 0 ? (
                        filteredDataTypes.map((item) => (
                          <button
                            key={toDataTypeId(item.id)}
                            type="button"
                            onClick={() => {
                              setSelectedDataType(toDataTypeId(item.id))
                              setIsDataTypeOpen(false)
                              setDataTypeSearch("")
                              setError("")
                              setSuccessUrl("")
                            }}
                            className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 ${
                              selectedDataType === toDataTypeId(item.id)
                                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <span>{getDataTypeLabel(item)}</span>
                            <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {toDataTypeId(item.id)}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No data type found.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Excel file
            </label>
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/40">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {file ? file.name : "Choose an .xlsx or .xls file"}
              </p>
              {file && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                Browse file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-error-300 bg-error-50 p-4 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </div>
          )}

          {successUrl && (
            <div className="rounded-lg border border-success-300 bg-success-50 p-4 text-sm text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400">
              Excel file uploaded and saved successfully.
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Importing..." : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
