"use client"

import React, { useEffect, useMemo, useState } from "react"
import type { ApexOptions } from "apexcharts"
import AnalyticsMetrics from "./AnalyticsMetrics"
import {
  loadExcelAnalytics,
  type AnalyticsProgram,
  type ExcelAnalyticsData,
} from "./useExcelAnalytics"
import type { DataYear } from "@/types/dataYear"
import dynamic from "next/dynamic"

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
})

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

type ExcelAnalyticsResponse = ExcelAnalyticsData

function toId(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

type Props = {
  selectedDataYear: string
  dataYears: DataYear[]
  program: AnalyticsProgram
  programLabel: string
  organization: string
  onOrganizationChange: (value: string) => void
}

export default function EducationAnalyticsDashboard({
  selectedDataYear,
  dataYears,
  program,
  programLabel,
  organization,
  onOrganizationChange,
}: Props) {
  const [analytics, setAnalytics] = useState<ExcelAnalyticsResponse | null>(
    null,
  )
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!selectedDataYear) {
      setAnalytics(null)
      return
    }

    const loadAnalytics = async () => {
      setLoadingAnalytics(true)
      setError("")

      try {
        const body = await loadExcelAnalytics(
          organization,
          selectedDataYear,
          program,
        )
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
  }, [organization, program, selectedDataYear])

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
        title: "School Totals",
        value: formatNumber(schoolRows),
        change: schoolRows > 0 ? "Loaded" : "No data",
        direction: schoolRows > 0 ? "up" : "warning",
        comparisonText: `${schoolFiles} file${schoolFiles === 1 ? "" : "s"} | ${programLabel}`,
      },
      {
        id: 2,
        title: "Teacher Totals",
        value: formatNumber(teacherRows),
        change: teacherRows > 0 ? "Loaded" : "No data",
        direction: teacherRows > 0 ? "up" : "warning",
        comparisonText: `${teacherFiles} file${teacherFiles === 1 ? "" : "s"} | ${programLabel}`,
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
  }, [analytics, programLabel, selectedDataYearLabel])

  const summaryWarnings = [
    ...(analytics?.schools?.errors ?? []).map((item) => ({
      type: `${programLabel} School`,
      fileName: item.file?.name,
      error: item.error,
    })),
    ...(analytics?.teachers?.errors ?? []).map((item) => ({
      type: `${programLabel} Teacher`,
      fileName: item.file?.name,
      error: item.error,
    })),
    ...(analytics?.qle?.errors ?? []).map((item) => ({
      type: `${programLabel} School QLE`,
      fileName: item.file?.name,
      error: item.error,
    })),
  ].filter((item) => item.error)
  const qleSummary = analytics?.qleSummary
  const qleFiles = analytics?.qle?.files?.length ?? 0

  if (!selectedDataYear) {
    return (
      <div className="col-span-12">
        {loadingAnalytics ? (
          <AnalyticsMetricsSkeleton />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a data year above to view analytics.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="col-span-12">
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

      {loadingAnalytics ? (
        <>
          <AnalyticsMetricsSkeleton />
          <QleSummarySkeleton />
        </>
      ) : (
        <>
          <AnalyticsMetrics items={metrics} />
          <div className="mt-4">
            <QleSummaryPanel
              programLabel={programLabel}
              fileCount={qleFiles}
              rowCount={qleSummary?.rowCount ?? 0}
              averagePercentage={qleSummary?.averagePercentage ?? 0}
              gradeCounts={
                qleSummary?.gradeCounts ?? {
                  A: 0,
                  B: 0,
                  C: 0,
                  D: 0,
                }
              }
              columns={qleSummary?.columns}
              organizations={analytics?.organizations ?? []}
              selectedOrganization={organization}
              onOrganizationChange={onOrganizationChange}
              byOrganization={qleSummary?.byOrganization ?? []}
            />
          </div>
        </>
      )}
    </div>
  )
}

function formatDecimal(value: number, digits = 1) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

function QleSummaryPanel({
  programLabel,
  fileCount,
  rowCount,
  averagePercentage,
  gradeCounts,
  columns,
  organizations,
  selectedOrganization,
  onOrganizationChange,
  byOrganization,
}: {
  programLabel: string
  fileCount: number
  rowCount: number
  averagePercentage: number
  gradeCounts: Record<"A" | "B" | "C" | "D", number>
  columns?: {
    organization?: string | null
    percentage?: string | null
    mos?: string | null
    grade?: string | null
  }
  organizations: string[]
  selectedOrganization: string
  onOrganizationChange: (value: string) => void
  byOrganization: Array<{
    organization: string
    rowCount: number
    averagePercentage: number
    averageMos: number
    gradeCounts: Record<"A" | "B" | "C" | "D", number>
  }>
}) {
  const hasMappedColumns = Boolean(
    columns?.percentage || columns?.mos || columns?.grade,
  )
  const showOrganizationRows =
    selectedOrganization === "all" && byOrganization.length > 0
  const gradeLabels = ["A", "B", "C", "D"] as const
  const gradeSeries = gradeLabels.map((grade) => gradeCounts[grade])
  const gradeColors = ["#10B981", "#465FFF", "#F59E0B", "#EF4444"]
  const qlePercentage =
    averagePercentage > 0 && averagePercentage <= 1
      ? averagePercentage * 100
      : averagePercentage
  const aToCTotal = gradeCounts.A + gradeCounts.B + gradeCounts.C
  const aToCNTotal = gradeCounts.D
  const normalizedPercentage = Math.min(Math.max(qlePercentage, 0), 100)
  const percentageSeries = [
    Math.round(normalizedPercentage * 10) / 10,
    Math.round((100 - normalizedPercentage) * 10) / 10,
  ]
  const percentageChartOptions: ApexOptions = {
    colors: ["#10B981", "#E5E7EB"],
    labels: ["QLE Percentage", "Remaining"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 260,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: {
              show: true,
              color: "#667085",
              fontSize: "12px",
            },
            value: {
              show: true,
              color: "#1D2939",
              fontSize: "22px",
              fontWeight: 600,
              formatter: () => `${formatDecimal(normalizedPercentage, 1)}%`,
            },
            total: {
              show: true,
              label: "Percentage",
              formatter: () => `${formatDecimal(normalizedPercentage, 1)}%`,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    stroke: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: (value) => `${formatDecimal(Number(value), 1)}%`,
      },
    },
  }
  const gradeChartOptions: ApexOptions = {
    colors: gradeColors,
    labels: gradeLabels.map((grade) => `Grade ${grade}`),
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 280,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Schools",
              formatter: () =>
                gradeSeries
                  .reduce((total, value) => total + value, 0)
                  .toLocaleString(),
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit",
      markers: {
        size: 4,
        shape: "circle",
        strokeWidth: 0,
      },
    },
    stroke: {
      show: false,
    },
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            {programLabel} School QLE
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            MOS Grade A-D
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <select
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            value={selectedOrganization}
            onChange={(event) => onOrganizationChange(event.target.value)}
          >
            <option value="all">All organizations</option>
            {organizations.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {fileCount} file{fileCount === 1 ? "" : "s"} | {rowCount} row
            {rowCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900 sm:col-span-2 xl:col-span-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              A to C QLE
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/[0.03]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Y total
                </p>
                <p className="mt-1 text-xl font-semibold text-success-600 dark:text-success-400">
                  {aToCTotal.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/[0.03]">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  N total
                </p>
                <p className="mt-1 text-xl font-semibold text-error-600 dark:text-error-400">
                  {aToCNTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          {gradeLabels.map((grade) => (
            <div
              key={grade}
              className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900"
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                MOS Grade {grade}
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                {gradeCounts[grade].toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Total school
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
            <p className="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              QLE Percentage
            </p>
            <div className="flex min-h-[260px] items-center justify-center">
              <ReactApexChart
                key={`qle-percentage-${percentageSeries.join("-")}`}
                options={percentageChartOptions}
                series={percentageSeries}
                type="donut"
                height={260}
              />
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
            <p className="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              MOS Grade Distribution
            </p>
            <div className="flex min-h-[260px] items-center justify-center">
              <ReactApexChart
                key={`qle-grade-${gradeSeries.join("-")}`}
                options={gradeChartOptions}
                series={gradeSeries}
                type="donut"
                height={260}
              />
            </div>
          </div>
        </div>
      </div>

      {!hasMappedColumns && rowCount > 0 && (
        <p className="mt-3 text-xs text-warning-600 dark:text-warning-400">
          QLE file loaded, but Grade columns were not found.
        </p>
      )}

      {showOrganizationRows && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-3 py-2">Organization</th>
                <th className="px-3 py-2">Total school</th>
                <th className="px-3 py-2">Grade A</th>
                <th className="px-3 py-2">Grade B</th>
                <th className="px-3 py-2">Grade C</th>
                <th className="px-3 py-2">Grade D</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {byOrganization.map((item) => (
                <tr key={item.organization}>
                  <td className="px-3 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.organization}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {item.rowCount.toLocaleString()}
                  </td>
                  {(["A", "B", "C", "D"] as const).map((grade) => (
                    <td
                      key={grade}
                      className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400"
                    >
                      {item.gradeCounts[grade].toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function QleSummarySkeleton() {
  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    </div>
  )
}

function AnalyticsMetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      ))}
    </div>
  )
}
