"use client"
import React, { useState } from "react"
// import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts"
import { useExcelAnalytics } from "./useExcelAnalytics"

import dynamic from "next/dynamic"

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
})

export default function AnalyticsBarChart() {
  const [organization, setOrganization] = useState("all")
  const { data, loading } = useExcelAnalytics(organization)
  const organizationData = data?.charts?.educationByOrganization?.length
    ? data.charts.educationByOrganization
    : [{ name: "No data", students: 0, schools: 0, teachers: 0 }]

  const options: ApexOptions = {
    colors: ["#465fff", "#7592ff", "#c2d6ff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
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
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
            Education Analytics
          </h3>
          <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
            {loading
              ? "Loading excel_data..."
              : "Students, schools and teachers by organization from excel_data"}
          </span>
        </div>
        <select
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
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
        <div className="-ml-5 min-w-[1300px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  )
}
