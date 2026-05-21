"use client"
import React from "react"
// import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts"
import { useExcelAnalytics } from "./useExcelAnalytics"

import dynamic from "next/dynamic"

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
})

type Props = {
  dataYearId?: string
  program?: "be" | "eccd" | "ie"
  organization?: string
  onOrganizationChange?: (value: string) => void
  organizations?: string[]
}

export default function AnalyticsBarChart({
  dataYearId,
  program = "be",
  organization = "all",
  onOrganizationChange,
  organizations = [],
}: Props) {
  const { data, loading } = useExcelAnalytics(organization, dataYearId, program)
  const organizationData = data?.charts?.educationByOrganization?.length
    ? data.charts.educationByOrganization
    : [{ name: "No data", students: 0, schools: 0, teachers: 0 }]

  const options: ApexOptions = {
    colors: ["#465fff", "#7592ff", "#c2d6ff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 260,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: organizationData.map((org) => org.name),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },

    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  }

  const series = [
    {
      name: "Students",
      data: organizationData.map((org) => org.students),
    },
    {
      name: "Schools",
      data: organizationData.map((org) => org.schools),
    },
    {
      name: "Teachers",
      data: organizationData.map((org) => org.teachers),
    },
  ]
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="mb-0.5 text-base font-semibold text-gray-800 dark:text-white/90">
            Education Analytics
          </h3>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            {loading
              ? "Loading..."
              : "Students, schools and teachers by organization from excel_data"}
          </span>
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
      {loading ? (
        <div className="mt-3 h-[260px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      ) : !dataYearId ? (
        <div className="flex h-[260px] items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Select a data year to view chart
          </p>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[1300px] xl:min-w-full pl-2">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={260}
            />
          </div>
        </div>
      )}
    </div>
  )
}
