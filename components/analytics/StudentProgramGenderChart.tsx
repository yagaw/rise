"use client"

import React, { useState } from "react"
import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import { MoreDotIcon } from "@/icons"
import { Dropdown } from "../ui/dropdown/Dropdown"
import { DropdownItem } from "../ui/dropdown/DropdownItem"
import { useExcelAnalytics } from "./useExcelAnalytics"

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
})

type Props = {
  dataYearId?: string
  organization?: string
  sourceId: string
  title: string
}

export default function StudentProgramGenderChart({
  dataYearId,
  organization = "all",
  sourceId,
  title,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { data, loading } = useExcelAnalytics(organization, dataYearId, "be")
  const genderCounts = data?.charts?.studentSourceGender?.[sourceId] ?? {}
  const labels = Object.keys(genderCounts).length
    ? Object.keys(genderCounts)
    : ["Male", "Female"]
  const series = labels.map((label) => genderCounts[label] ?? 0)
  const chartColors = labels.map((label) =>
    label.toLowerCase() === "female" ? "#F472B6" : "#3B82F6",
  )
  const maleCount = genderCounts.Male ?? 0
  const femaleCount = genderCounts.Female ?? 0
  const totalStudents = maleCount + femaleCount
  const organizationLabel =
    organization === "all" ? "All organizations" : organization

  const options: ApexOptions = {
    colors: chartColors,
    labels,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      width: 445,
      height: 290,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
          labels: {
            show: true,
            value: {
              show: true,
              offsetY: 0,
            },
          },
        },
      },
    },
    states: {
      hover: { filter: { type: "none" } },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: { type: "darken" },
      },
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
    stroke: { show: false, width: 4 },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit",
      fontSize: "14px",
      fontWeight: 400,
      markers: { size: 4, shape: "circle", strokeWidth: 0 },
      itemMargin: { horizontal: 10, vertical: 0 },
      labels: { useSeriesColors: true },
    },
    responsive: [
      { breakpoint: 640, options: { chart: { width: 370, height: 290 } } },
    ],
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
        </div>
        <div className="relative h-fit">
          <button
            onClick={() => setIsOpen((current) => !current)}
            className="dropdown-toggle"
          >
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={() => setIsOpen(false)}
              className="flex w-full rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={() => setIsOpen(false)}
              className="flex w-full rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      <div className="mb-3 rounded-lg bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">
        <span className="text-gray-500 dark:text-gray-400">
          {organizationLabel}:
        </span>{" "}
        Male {maleCount.toLocaleString()} + Female{" "}
        {femaleCount.toLocaleString()} = Total{" "}
        {totalStudents.toLocaleString()}
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Male</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {maleCount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Female</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {femaleCount.toLocaleString()}
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
        <div className="mx-auto flex justify-center" id="chartDarkStyle">
          <ReactApexChart
            key={`${sourceId}-${labels.join("-")}-${series.join("-")}`}
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
