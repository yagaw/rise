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

export default function TeachersBySubjectChart({
  dataYearId,
  program = "be",
  organization = "all",
}: Props) {
  const { data, loading } = useExcelAnalytics(organization, dataYearId, program)
  const subjectCounts = data?.charts?.teachersBySubject ?? {}
  const subjectGenderCounts = data?.charts?.teachersBySubjectGender ?? {}
  const subjects = Object.keys(subjectCounts)
  const counts = Object.values(subjectCounts)
  const subjectRows = subjects.map((subject) => ({
    subject,
    total:
      subjectGenderCounts[subject]?.total ??
      subjectCounts[subject] ??
      0,
    male: subjectGenderCounts[subject]?.male ?? 0,
    female: subjectGenderCounts[subject]?.female ?? 0,
  }))

  const options: ApexOptions = {
    colors: [
      "#2a31d8",
      "#465fff",
      "#7592ff",
      "#c2d6ff",
      "#dde9ff",
      "#a855f7",
      "#ec4899",
      "#f59e0b",
      "#10b981",
    ],
    chart: { fontFamily: "Outfit, sans-serif", type: "donut", height: 320 },
    labels: subjects,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit",
    },
    dataLabels: { enabled: false },
  }
  const series = counts

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Teachers by Subject Competency
          </h3>
          <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
            Distribution across subject areas
          </span>
        </div>
      </div>
      {loading ? (
        <div className="h-[320px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      ) : !dataYearId ? (
        <div className="flex h-[320px] items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Select a data year to view chart
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-center mx-auto">
            <ReactApexChart
              key={`${subjects.join("-")}-${series.join("-")}`}
              options={options}
              series={series}
              type="donut"
              height={320}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {subjectRows.map((item) => (
              <div
                key={item.subject}
                className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.subject}
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Total {item.total.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Male {item.male.toLocaleString()} + Female{" "}
                  {item.female.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
