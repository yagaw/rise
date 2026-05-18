"use client"
import React, { useState } from "react"
import { ApexOptions } from "apexcharts"
import { Dropdown } from "../ui/dropdown/Dropdown"
import { DropdownItem } from "../ui/dropdown/DropdownItem"
import { MoreDotIcon } from "@/icons"
import dynamic from "next/dynamic"
import { useExcelAnalytics } from "./useExcelAnalytics"

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
})

export default function StudentGenderSessionChart() {
  const [isOpen, setIsOpen] = useState(false)
  const [organization, setOrganization] = useState("all")
  const { data, loading } = useExcelAnalytics(organization)
  const genderCounts = data?.charts?.studentGender ?? {}
  const labels = Object.keys(genderCounts).length
    ? Object.keys(genderCounts)
    : ["Male", "Female"]
  const series = labels.map((label) => genderCounts[label] ?? 0)

  const options: ApexOptions = {
    colors: ["#3641f5", "#dde9ff"],
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
  function toggleDropdown() {
    setIsOpen(!isOpen)
  }
  function closeDropdown() {
    setIsOpen(false)
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Students by Gender
          </h3>
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
        <div className="relative h-fit">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      <div>
        <div className="flex justify-center mx-auto" id="chartDarkStyle">
          <ReactApexChart
            key={`student-${labels.join("-")}-${series.join("-")}`}
            options={options}
            series={series}
            type="donut"
            height={290}
          />
        </div>
      </div>
    </div>
  )
}
