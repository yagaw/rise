"use client"
import React, { useMemo, useState } from "react"
import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { organizations, getOrganizationScopedData } from "@/data/education"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export default function TeachersByPositionChart() {
  const [organizationId, setOrganizationId] = useState<string>("all")
  const scoped = useMemo(
    () => getOrganizationScopedData(organizationId),
    [organizationId]
  )

  const positionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    scoped.teachers.forEach((t) => {
      const pos = t.position || "Unknown"
      counts[pos] = (counts[pos] || 0) + 1
    })
    return counts
  }, [scoped.teachers])

  const positions = Object.keys(positionCounts)
  const counts = Object.values(positionCounts)

  const options: ApexOptions = {
    colors: ["#3641f5", "#465fff", "#7592ff", "#c2d6ff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: positions,
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} teachers`,
      },
    },
  }

  const series = [
    {
      name: "Teachers",
      data: counts,
    },
  ]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Teachers by Position
          </h3>
          <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
            Distribution across positions
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
      <div>
        <ReactApexChart
          key={`${organizationId}-${counts.join("-")}`}
          options={options}
          series={series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  )
}
