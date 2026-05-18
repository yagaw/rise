"use client"
import React, { useState } from "react"
import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { useExcelAnalytics } from "./useExcelAnalytics"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function StudentsByGradeChart() {
  const [organization, setOrganization] = useState("all")
  const { data, loading } = useExcelAnalytics(organization)
  const gradeCounts = data?.charts?.studentsByGrade ?? {}
  const gradeOrder = Object.keys(gradeCounts).length
    ? Object.keys(gradeCounts)
    : ["No data"]
  const counts = gradeOrder.map((grade) => gradeCounts[grade] ?? 0)

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 300,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: gradeOrder,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: { yaxis: { lines: { show: true } } },
  }
  const series = [{ name: "Students", data: counts }]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Students by Grade
          </h3>
          <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
            Distribution across grades
          </span>
        </div>
        <select
          className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
          disabled={loading}
        >
          <option value="all">All organizations</option>
          {(data?.organizations ?? []).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[800px] xl:min-w-full pl-2">
          <ReactApexChart
            key={`${gradeOrder.join("-")}-${counts.join("-")}`}
            options={options}
            series={series}
            type="bar"
            height={300}
          />
        </div>
      </div>
    </div>
  )
}
