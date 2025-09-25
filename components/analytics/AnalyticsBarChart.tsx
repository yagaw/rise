"use client"
import React from "react"
// import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts"
import ChartTab from "../common/ChartTab"
import { organizations, getOrganizationScopedData } from "@/data/education"

import dynamic from "next/dynamic"

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
})

export default function AnalyticsBarChart() {
  // Get education data for all organizations
  const organizationData = organizations.map((org) => {
    const scopedData = getOrganizationScopedData(org.id)
    return {
      name: org.name,
      students: scopedData.students.length,
      schools: scopedData.schools.length,
      teachers: scopedData.teachers.length,
    }
  })

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
            Students, schools and teachers by organization
          </span>
        </div>
        <ChartTab />
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
