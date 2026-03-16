"use client"
import React, { useMemo, useState } from "react"
import AnalyticsMetrics from "./AnalyticsMetrics"
import { getOrganizationScopedData, organizations } from "@/data/education"

type MetricItem = {
  id: number
  title: string
  value: string
  change: string
  direction: "up" | "down" | "warning"
  comparisonText: string
}

export default function EducationAnalyticsDashboard() {
  const [organizationId, setOrganizationId] = useState<string>("all")

  const scoped = useMemo(
    () => getOrganizationScopedData(organizationId),
    [organizationId],
  )

  const metrics: MetricItem[] = useMemo(() => {
    const schoolCount = scoped.schools.length
    const studentCount = scoped.students.length
    const teacherCount = scoped.teachers.length
    const schoolYearCount = scoped.schoolYears.length

    return [
      {
        id: 1,
        title: "Schools",
        value: String(schoolCount),
        change: "+0%",
        direction: "up",
        comparisonText:
          organizationId === "all" ? "Across all orgs" : "Within org",
      },
      {
        id: 2,
        title: "Students",
        value: String(studentCount),
        change: "+0%",
        direction: "up",
        comparisonText:
          organizationId === "all" ? "Across all orgs" : "Within org",
      },
      {
        id: 3,
        title: "Teachers",
        value: String(teacherCount),
        change: "+0%",
        direction: "up",
        comparisonText:
          organizationId === "all" ? "Across all orgs" : "Within org",
      },
      {
        id: 4,
        title: "School Years",
        value: String(schoolYearCount),
        change: "+0%",
        direction: "up",
        comparisonText:
          organizationId === "all" ? "Across all orgs" : "Within org",
      },
    ]
  }, [organizationId, scoped])

  return (
    <div className="col-span-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Education Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track key metrics across your education network
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label
            htmlFor="orgSelect"
            className="text-theme-sm text-gray-500 dark:text-gray-400"
          >
            Filter by
          </label>
          <div className="relative">
            <select
              id="orgSelect"
              className="appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 shadow-theme-xs transition-colors focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-brand-800"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
            >
              <option value="all">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <AnalyticsMetrics items={metrics} />
    </div>
  )
}
