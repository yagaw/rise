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
  organizations?: string[]
  onOrganizationChange?: (value: string) => void
}

export default function ClassroomObservationDonut({
  dataYearId,
  program = "be",
  programLabel,
  organization = "all",
  organizations = [],
  onOrganizationChange,
}: Props) {
  const { data, loading } = useExcelAnalytics(organization, dataYearId, program)
  const summary = data?.classroomObservationSummary
  const achieved = summary?.achieved ?? 0
  const notAchieved = summary?.notAchieved ?? 0
  const unknown = summary?.unknown ?? 0
  const total = achieved + notAchieved + unknown
  const series = [achieved, notAchieved]
  const organizationLabel =
    organization === "all" ? "All organizations" : organization

  const options: ApexOptions = {
    colors: ["#10B981", "#EF4444"],
    labels: ["Achieved (Y)", "Not Achieved (N)"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 290,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => total.toLocaleString(),
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {programLabel} Classroom Observation
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Achieved (Y) / Not Achieved (N) by organization
          </p>
        </div>
        {onOrganizationChange && (
          <select
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            value={organization}
            onChange={(event) => onOrganizationChange(event.target.value)}
            disabled={loading || !dataYearId}
          >
            <option value="all">All organizations</option>
            {organizations.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-3 rounded-lg bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">
        <span className="text-gray-500 dark:text-gray-400">
          {organizationLabel}:
        </span>{" "}
        Total {total.toLocaleString()} observation{total === 1 ? "" : "s"}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Achieved (Y)
          </p>
          <p className="text-sm font-semibold text-success-600 dark:text-success-400">
            {achieved.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Not Achieved (N)
          </p>
          <p className="text-sm font-semibold text-error-600 dark:text-error-400">
            {notAchieved.toLocaleString()}
          </p>
        </div>
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
        <div className="flex justify-center">
          <ReactApexChart
            key={`classroom-observation-${program}-${organization}-${series.join("-")}`}
            options={options}
            series={series}
            type="donut"
            height={290}
          />
        </div>
      )}
    </div>
  )
}
