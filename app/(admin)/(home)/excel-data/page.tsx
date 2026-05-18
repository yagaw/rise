"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"
import type { DataYear } from "@/types/dataYear"

type DataType = {
  id: string | number
  title?: string
  name?: string
  type?: string
  remark?: string
}

type ExcelDataRecord = {
  id: string | number
  created_at?: string
  data_year?: string | number
  data_type?: string | number
  name?: string
  url?: string
}

type ApiError = {
  error?: string
}

function toId(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value)
}

function getDataTypeLabel(dataType: DataType) {
  return (
    dataType.title ||
    dataType.name ||
    dataType.type ||
    dataType.remark ||
    toId(dataType.id)
  )
}

function isExcelFile(file: File) {
  const lowerName = file.name.toLowerCase()
  return lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) return {} as T
  return JSON.parse(text) as T
}

export default function ExcelDataPage() {
  const [records, setRecords] = useState<ExcelDataRecord[]>([])
  const [dataYears, setDataYears] = useState<DataYear[]>([])
  const [dataTypes, setDataTypes] = useState<DataType[]>([])
  const [selectedDataYear, setSelectedDataYear] = useState("")
  const [selectedDataType, setSelectedDataType] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editingRecord, setEditingRecord] = useState<ExcelDataRecord | null>(
    null,
  )
  const [editName, setEditName] = useState("")
  const [editDataYear, setEditDataYear] = useState("")
  const [editDataType, setEditDataType] = useState("")
  const [replacementFile, setReplacementFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const dataYearLabelById = useMemo(() => {
    const labels = new Map<string, string>()
    dataYears.forEach((dataYear) => {
      labels.set(toId(dataYear.id), dataYear.title || toId(dataYear.id))
    })
    return labels
  }, [dataYears])

  const dataTypeLabelById = useMemo(() => {
    const labels = new Map<string, string>()
    dataTypes.forEach((dataType) => {
      labels.set(toId(dataType.id), getDataTypeLabel(dataType))
    })
    return labels
  }, [dataTypes])

  const loadOptions = async () => {
    const [dataYearResponse, dataTypeResponse] = await Promise.all([
      fetch("/api/data_year"),
      fetch("/api/data_type"),
    ])

    if (!dataYearResponse.ok) {
      throw new Error("Failed to load data years.")
    }

    if (!dataTypeResponse.ok) {
      throw new Error("Failed to load data types.")
    }

    const [dataYearRows, dataTypeRows] = await Promise.all([
      dataYearResponse.json() as Promise<DataYear[]>,
      dataTypeResponse.json() as Promise<DataType[]>,
    ])

    setDataYears(dataYearRows)
    setDataTypes(dataTypeRows)
  }

  const loadRecords = async () => {
    const params = new URLSearchParams()

    if (selectedDataYear) params.set("data_year", selectedDataYear)
    if (selectedDataType) params.set("data_type", selectedDataType)
    if (searchTerm.trim()) params.set("search", searchTerm.trim())

    const response = await fetch(`/api/excel_data?${params.toString()}`)
    const body = await parseJson<ExcelDataRecord[] & ApiError>(response)

    if (!response.ok) {
      throw new Error(body.error || "Failed to load Excel data.")
    }

    setRecords(Array.isArray(body) ? body : [])
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")

      try {
        await loadOptions()
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load options."
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")

      try {
        await loadRecords()
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load Excel data."
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [selectedDataYear, selectedDataType, searchTerm])

  const openEditor = (record: ExcelDataRecord) => {
    setEditingRecord(record)
    setEditName(record.name || "")
    setEditDataYear(toId(record.data_year))
    setEditDataType(toId(record.data_type))
    setReplacementFile(null)
    setError("")
    setSuccess("")

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const closeEditor = () => {
    setEditingRecord(null)
    setReplacementFile(null)
  }

  const handleSaveMetadata = async (event: FormEvent) => {
    event.preventDefault()

    if (!editingRecord) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/excel_data/${editingRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          data_year: editDataYear,
          data_type: editDataType,
        }),
      })
      const body = await parseJson<ExcelDataRecord & ApiError>(response)

      if (!response.ok) {
        throw new Error(body.error || "Failed to update Excel data.")
      }

      setRecords((currentRecords) =>
        currentRecords.map((record) =>
          toId(record.id) === toId(body.id) ? body : record,
        ),
      )
      setEditingRecord(body)
      setSuccess("Excel data updated.")
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Failed to update Excel data."
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleReplacementFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    setError("")
    setSuccess("")

    if (!file) {
      setReplacementFile(null)
      return
    }

    if (!isExcelFile(file)) {
      setReplacementFile(null)
      setError("Only .xlsx and .xls files can be uploaded.")
      event.target.value = ""
      return
    }

    setReplacementFile(file)
  }

  const handleReplaceFile = async () => {
    if (!editingRecord || !replacementFile) return

    const params = new URLSearchParams({
      name: editName || editingRecord.name || "",
      fileName: replacementFile.name,
      fileType: replacementFile.type,
    })

    setReplacing(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(
        `/api/excel_data/${editingRecord.id}?${params.toString()}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": replacementFile.type || "application/octet-stream",
          },
          body: replacementFile,
        },
      )
      const body = await parseJson<ExcelDataRecord & ApiError>(response)

      if (!response.ok) {
        throw new Error(body.error || "Failed to replace Excel file.")
      }

      setRecords((currentRecords) =>
        currentRecords.map((record) =>
          toId(record.id) === toId(body.id) ? body : record,
        ),
      )
      setEditingRecord(body)
      setEditName(body.name || "")
      setReplacementFile(null)
      setSuccess("Excel file replaced.")

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (replaceError) {
      const message =
        replaceError instanceof Error
          ? replaceError.message
          : "Failed to replace Excel file."
      setError(message)
    } finally {
      setReplacing(false)
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Excel Data" />

      <div className="rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_1.5fr_auto] lg:items-end">
            <div>
              <label
                htmlFor="filter_data_year"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Data year
              </label>
              <select
                id="filter_data_year"
                value={selectedDataYear}
                onChange={(event) => setSelectedDataYear(event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="" className="dark:bg-gray-900">
                  All data years
                </option>
                {dataYears.map((dataYear) => (
                  <option
                    key={toId(dataYear.id)}
                    value={toId(dataYear.id)}
                    className="dark:bg-gray-900"
                  >
                    {dataYear.title || toId(dataYear.id)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter_data_type"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Data type
              </label>
              <select
                id="filter_data_type"
                value={selectedDataType}
                onChange={(event) => setSelectedDataType(event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="" className="dark:bg-gray-900">
                  All data types
                </option>
                {dataTypes.map((dataType) => (
                  <option
                    key={toId(dataType.id)}
                    value={toId(dataType.id)}
                    className="dark:bg-gray-900"
                  >
                    {getDataTypeLabel(dataType)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="excel_search"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Search
              </label>
              <input
                id="excel_search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name..."
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedDataYear("")
                setSelectedDataType("")
                setSearchTerm("")
              }}
              className="h-11"
            >
              Clear
            </Button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-5 rounded-lg border border-error-300 bg-error-50 p-4 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mx-5 mt-5 rounded-lg border border-success-300 bg-success-50 p-4 text-sm text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400">
            {success}
          </div>
        )}

        <div className="custom-scrollbar max-w-full overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Name
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Data year
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Data type
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Created
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  File
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Loading Excel data...
                  </td>
                </tr>
              )}

              {!loading && records.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No Excel data found.
                  </td>
                </tr>
              )}

              {!loading &&
                records.map((record) => (
                  <tr
                    key={toId(record.id)}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {record.name || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {dataYearLabelById.get(toId(record.data_year)) ||
                        toId(record.data_year) ||
                        "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {dataTypeLabelById.get(toId(record.data_type)) ||
                        toId(record.data_type) ||
                        "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {record.created_at
                        ? new Date(record.created_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {record.url ? (
                        <a
                          href={record.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                        >
                          View Excel
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditor(record)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingRecord && (
        <div className="fixed inset-0 z-99999 overflow-y-auto bg-gray-400/50 px-3 py-4 backdrop-blur-[20px] sm:px-5 sm:py-6">
          <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900">
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Edit Excel Data
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Update metadata or replace the uploaded Excel file.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  aria-label="Close editor"
                >
                  x
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveMetadata} className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="edit_name"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Name
                  </label>
                  <input
                    id="edit_name"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit_data_year"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Data year
                  </label>
                  <select
                    id="edit_data_year"
                    value={editDataYear}
                    onChange={(event) => setEditDataYear(event.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="" className="dark:bg-gray-900">
                      Select data year
                    </option>
                    {dataYears.map((dataYear) => (
                      <option
                        key={toId(dataYear.id)}
                        value={toId(dataYear.id)}
                        className="dark:bg-gray-900"
                      >
                        {dataYear.title || toId(dataYear.id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="edit_data_type"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Data type
                  </label>
                  <select
                    id="edit_data_type"
                    value={editDataType}
                    onChange={(event) => setEditDataType(event.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="" className="dark:bg-gray-900">
                      Select data type
                    </option>
                    {dataTypes.map((dataType) => (
                      <option
                        key={toId(dataType.id)}
                        value={toId(dataType.id)}
                        className="dark:bg-gray-900"
                      >
                        {getDataTypeLabel(dataType)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} isLoading={saving}>
                  Save Metadata
                </Button>
              </div>
            </form>

            <div className="border-t border-gray-100 p-5 dark:border-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Replace Excel File
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleReplacementFileChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
                <Button
                  size="sm"
                  onClick={handleReplaceFile}
                  disabled={!replacementFile || replacing}
                  isLoading={replacing}
                  className="h-11 whitespace-nowrap"
                >
                  Replace File
                </Button>
              </div>
              {replacementFile && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Selected: {replacementFile.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
