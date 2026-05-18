"use client"
import React, { useState } from "react"
import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { useExcelAnalytics } from "./useExcelAnalytics"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function TeachersBySubjectChart() {
  const [organization, setOrganization] = useState("all")
  const { data, loading } = useExcelAnalytics(organization)
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
    </div>
  )
}
