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
    [organizationId]
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
      <div className="mb-4 flex items-center gap-3">
        <label
          htmlFor="orgSelect"
          className="text-theme-sm text-gray-600 dark:text-gray-300"
        >
          Organization
        </label>
        <select
          id="orgSelect"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
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

      <AnalyticsMetrics items={metrics} />
    </div>
  )
}
