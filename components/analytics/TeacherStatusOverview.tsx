"use client"
import React, { useMemo, useState } from "react"
import { organizations, getOrganizationScopedData } from "@/data/education"

export default function TeacherStatusOverview() {
  const [organizationId, setOrganizationId] = useState<string>("all")
  const scoped = useMemo(
    () => getOrganizationScopedData(organizationId),
    [organizationId]
  )

  const teacherStats = useMemo(() => {
    const byStatus: Record<string, number> = {}
    const byPosition: Record<string, number> = {}
    const byEducation: Record<string, number> = {}
    let totalExperience = 0
    let teachersWithExp = 0

    scoped.teachers.forEach((t) => {
      const status = t.status || "Unknown"
      const position = t.position || "Unknown"
      const education = t.edu_level || "Unknown"

      byStatus[status] = (byStatus[status] || 0) + 1
      byPosition[position] = (byPosition[position] || 0) + 1
      byEducation[education] = (byEducation[education] || 0) + 1

      if (t.teach_exp_year) {
        totalExperience += t.teach_exp_year
        teachersWithExp++
      }
    })

    const avgExperience =
      teachersWithExp > 0 ? (totalExperience / teachersWithExp).toFixed(1) : "0"

    return { byStatus, byPosition, byEducation, avgExperience }
  }, [scoped.teachers])

  const statusColors: Record<string, string> = {
    new: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    stay: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    transfer_from:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    resume:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    transfer_to:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    retire: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    resign: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Teacher Status Overview
          </h3>
          <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
            Status, education level, and average experience
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Status */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            By Status
          </h4>
          <div className="space-y-2">
            {Object.entries(teacherStats.byStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between p-2 rounded"
              >
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    statusColors[status] ||
                    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                  }`}
                >
                  {status.replace("_", " ")}
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By Education Level */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Education Level
          </h4>
          <div className="space-y-2">
            {Object.entries(teacherStats.byEducation)
              .sort((a, b) => b[1] - a[1])
              .map(([education, count]) => (
                <div
                  key={education}
                  className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {education}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Average Experience */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Average Experience
          </h4>
          <div className="flex flex-col items-center justify-center h-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {teacherStats.avgExperience}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              years
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
