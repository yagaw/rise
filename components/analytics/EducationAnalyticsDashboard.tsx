"use client"

import React, { useEffect, useMemo, useState } from "react"
import AnalyticsMetrics from "./AnalyticsMetrics"
import type { DataYear } from "@/types/dataYear"

type MetricItem = {
  id: number
  title: string
  value: string
  change: string
  direction: "up" | "down" | "warning"
  comparisonText: string
}

type ExcelFile = {
  id: string | number
  data_type?: string | number
  name?: string
  url?: string
}

type ExcelSummary = {
  rowCount: number
  fieldCount: number
  files?: ExcelFile[]
  errors?: Array<{ file: ExcelFile | null; error: string | null }>
}

type ExcelAnalyticsResponse = {
  excelFiles?: ExcelFile[]
  schools?: ExcelSummary
  teachers?: ExcelSummary
  totals?: {
    excelFiles: number
    rows: number
    fields: number
  }
  error?: string
}

function toId(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text()

  if (!text) return {} as T

  return JSON.parse(text) as T
}

export default function EducationAnalyticsDashboard() {
  const [dataYears, setDataYears] = useState<DataYear[]>([])
  const [selectedDataYear, setSelectedDataYear] = useState("")
  const [analytics, setAnalytics] = useState<ExcelAnalyticsResponse | null>(
    null,
  )
  const [loadingYears, setLoadingYears] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadDataYears = async () => {
      try {
        const response = await fetch("/api/data_year")

        if (!response.ok) {
          throw new Error("Failed to load data years.")
        }

        const rows = (await response.json()) as DataYear[]
        setDataYears(rows)
        setSelectedDataYear((current) => current || toId(rows[0]?.id))
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load data years."
        setError(message)
      } finally {
        setLoadingYears(false)
      }
    }

    loadDataYears()
  }, [])

  useEffect(() => {
    if (!selectedDataYear) {
      setAnalytics(null)
      return
    }

    const loadAnalytics = async () => {
      setLoadingAnalytics(true)
      setError("")

      try {
        const params = new URLSearchParams({ data_year: selectedDataYear })
        const response = await fetch(
          `/api/analytics/excel?${params.toString()}`,
        )
        const body = await parseJson<ExcelAnalyticsResponse>(response)

        if (!response.ok) {
          throw new Error(body.error || "Failed to load Excel analytics.")
        }

        setAnalytics(body)
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load Excel analytics."
        setAnalytics(null)
        setError(message)
      } finally {
        setLoadingAnalytics(false)
      }
    }

    loadAnalytics()
  }, [selectedDataYear])

  const selectedDataYearLabel = useMemo(() => {
    const found = dataYears.find(
      (dataYear) => toId(dataYear.id) === selectedDataYear,
    )

    return found?.title || selectedDataYear || "No data year"
  }, [dataYears, selectedDataYear])

  const metrics: MetricItem[] = useMemo(() => {
    const schoolRows = analytics?.schools?.rowCount ?? 0
    const teacherRows = analytics?.teachers?.rowCount ?? 0
    const excelFiles = analytics?.totals?.excelFiles ?? 0
    const totalRows = analytics?.totals?.rows ?? 0
    const schoolFiles = analytics?.schools?.files?.length ?? 0
    const teacherFiles = analytics?.teachers?.files?.length ?? 0

    return [
      {
        id: 1,
        title: "School Rows",
        value: formatNumber(schoolRows),
        change: schoolRows > 0 ? "Loaded" : "No data",
        direction: schoolRows > 0 ? "up" : "warning",
        comparisonText: `${schoolFiles} file${schoolFiles === 1 ? "" : "s"} | data_type 1`,
      },
      {
        id: 2,
        title: "Teacher Rows",
        value: formatNumber(teacherRows),
        change: teacherRows > 0 ? "Loaded" : "No data",
        direction: teacherRows > 0 ? "up" : "warning",
        comparisonText: `${teacherFiles} file${teacherFiles === 1 ? "" : "s"} | data_type 2`,
      },
      {
        id: 3,
        title: "Excel Files",
        value: formatNumber(excelFiles),
        change: excelFiles > 0 ? "Available" : "Missing",
        direction: excelFiles > 0 ? "up" : "warning",
        comparisonText: "From excel_data",
      },
      {
        id: 4,
        title: "Total Excel Rows",
        value: formatNumber(totalRows),
        change: totalRows > 0 ? "Ready" : "No rows",
        direction: totalRows > 0 ? "up" : "warning",
        comparisonText: selectedDataYearLabel,
      },
    ]
  }, [analytics, selectedDataYearLabel])

  const excelDataGroups = useMemo(() => {
    const rows = analytics?.excelFiles ?? []

    return [
      {
        title: "School Data",
        type: "data_type 1",
        rows: rows.filter((row) => toId(row.data_type) === "1"),
      },
      {
        title: "Teacher Data",
        type: "data_type 2",
        rows: rows.filter((row) => toId(row.data_type) === "2"),
      },
    ]
  }, [analytics?.excelFiles])

  const summaryWarnings = [
    ...(analytics?.schools?.errors ?? []).map((item) => ({
      type: "School",
      fileName: item.file?.name,
      error: item.error,
    })),
    ...(analytics?.teachers?.errors ?? []).map((item) => ({
      type: "Teacher",
      fileName: item.file?.name,
      error: item.error,
    })),
  ].filter((item) => item.error)

  return (
    <div className="col-span-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Data Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Metrics are calculated from database.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label
            htmlFor="analyticsDataYear"
            className="text-theme-sm text-gray-500 dark:text-gray-400"
          >
            Data year
          </label>
          <div className="relative">
            <select
              id="analyticsDataYear"
              className="appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 shadow-theme-xs transition-colors focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-brand-800"
              value={selectedDataYear}
              onChange={(event) => setSelectedDataYear(event.target.value)}
              disabled={loadingYears || loadingAnalytics}
            >
              <option value="">
                {loadingYears ? "Loading data years..." : "Select data year"}
              </option>
              {dataYears.map((dataYear) => (
                <option key={toId(dataYear.id)} value={toId(dataYear.id)}>
                  {dataYear.title || toId(dataYear.id)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 p-4 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {summaryWarnings.length > 0 && (
        <div className="mb-4 rounded-lg border border-warning-300 bg-warning-50 p-4 text-sm text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-400">
          {summaryWarnings.map((warning) => (
            <p key={`${warning.type}-${warning.fileName}-${warning.error}`}>
              {warning.type} Excel warning
              {warning.fileName ? ` (${warning.fileName})` : ""}:{" "}
              {warning.error}
            </p>
          ))}
        </div>
      )}

      <AnalyticsMetrics items={metrics} />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {excelDataGroups.map((group) => (
          <div
            key={group.type}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  {group.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {group.type} | {selectedDataYearLabel}
                </p>
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                {group.rows.length} file{group.rows.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-2">
              {group.rows.map((row) => (
                <div
                  key={toId(row.id)}
                  className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                      {row.name || `Excel ${toId(row.id)}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ID {toId(row.id)}
                    </p>
                  </div>
                  {row.url && (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      View
                    </a>
                  )}
                </div>
              ))}

              {group.rows.length === 0 && (
                <p className="rounded-lg bg-gray-50 px-3 py-3 text-center text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  No files found.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
