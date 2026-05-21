"use client"
import React from "react"
import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { useExcelAnalytics } from "./useExcelAnalytics"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

type Props = {
  dataYearId?: string
  program?: "be" | "eccd" | "ie"
  organization?: string
}

export default function StudentsByGradeChart({
  dataYearId,
  program = "be",
  organization = "all",
}: Props) {
  const { data, loading } = useExcelAnalytics(organization, dataYearId, program)
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
      </div>
      {loading ? (
        <div className="h-[300px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      ) : !dataYearId ? (
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Select a data year to view chart
          </p>
        </div>
      ) : (
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
      )}
    </div>
  )
}
