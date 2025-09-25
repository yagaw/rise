"use client"
import React, { useMemo, useState } from "react"
import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { organizations, getOrganizationScopedData } from "@/data/education"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function TeachersBySubjectChart() {
  const [organizationId, setOrganizationId] = useState<string>("all")
  const scoped = useMemo(
    () => getOrganizationScopedData(organizationId),
    [organizationId]
  )

  const subjects = ["Math", "Science", "English", "History", "Biology"]
  const counts = subjects.map(
    (subj) => scoped.teachers.filter((t) => t.subject === subj).length
  )

  const options: ApexOptions = {
    colors: ["#2a31d8", "#465fff", "#7592ff", "#c2d6ff", "#dde9ff"],
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
            Teachers by Subject
          </h3>
          <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
            Distribution across subjects
          </span>
        </div>
        <select
          className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          value={organizationId}
          onChange={(e) => setOrganizationId(e.target.value)}
        >
          <option value="all">All organizations</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-center mx-auto">
        <ReactApexChart
          key={`${organizationId}-${series.join("-")}`}
          options={options}
          series={series}
          type="donut"
          height={320}
        />
      </div>
    </div>
  )
}
