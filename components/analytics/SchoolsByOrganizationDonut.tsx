"use client"

import type { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { useExcelAnalytics, type AnalyticsProgram } from "./useExcelAnalytics"

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
})

type Props = {
  dataYearId?: string
  program?: AnalyticsProgram
  programLabel: string
  organization?: string
}

const CHART_COLORS = [
  "#465FFF",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#64748B",
]

export default function SchoolsByOrganizationDonut({
  dataYearId,
  program = "be",
  programLabel,
  organization = "all",
}: Props) {
  const { data, loading } = useExcelAnalytics(organization, dataYearId, program)
  const organizationRows = data?.charts?.educationByOrganization ?? []
  const schoolRows = organizationRows.filter((item) => item.schools > 0)
  const labels = schoolRows.length
    ? schoolRows.map((item) => item.name)
    : ["No data"]
  const series = schoolRows.length
    ? schoolRows.map((item) => item.schools)
    : [0]
  const totalSchools = series.reduce((total, value) => total + value, 0)

  const options: ApexOptions = {
    colors: CHART_COLORS,
    labels,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 240,
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
              formatter: () => totalSchools.toLocaleString(),
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
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          School {programLabel} by Organization
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          School Excel data only, grouped by organization
        </p>
      </div>

      {loading ? (
        <div className="h-[290px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      ) : !dataYearId ? (
        <div className="flex h-[290px] items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Select a data year to view chart
          </p>
        </div>
      ) : (
        <div className="grid min-h-[290px] flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
          <div className="flex items-center justify-center">
            <ReactApexChart
              key={`${program}-${labels.join("-")}-${series.join("-")}`}
              options={options}
              series={series}
              type="donut"
              height={290}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1 dark:bg-gray-900">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Total
              </span>
              <span className="text-xs font-semibold text-gray-800 dark:text-white/90">
                {totalSchools.toLocaleString()}
              </span>
            </div>
            <div className="space-y-0.5">
              {schoolRows.length > 0 ? (
                schoolRows.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-3 border-b border-gray-100 px-1 py-0.5 last:border-b-0 dark:border-gray-800"
                  >
                    <span className="truncate text-[11px] text-gray-600 dark:text-gray-400">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-[11px] font-semibold text-gray-800 dark:text-white/90">
                      {item.schools.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="px-1 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No school data.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
