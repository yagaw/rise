"use client"
import React, { useMemo, useState } from "react"
import {
  organizations,
  getOrganizationScopedData,
  schools as allSchools,
} from "@/data/education"

export default function TopSchoolsByEnrollment() {
  const [organizationId, setOrganizationId] = useState<string>("all")
  const scoped = useMemo(
    () => getOrganizationScopedData(organizationId),
    [organizationId]
  )

  const enrollmentBySchool = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of scoped.students) {
      counts[s.schoolId] = (counts[s.schoolId] ?? 0) + 1
    }
    const records = Object.entries(counts)
      .map(([schoolId, count]) => ({
        schoolId,
        name: allSchools.find((sc) => sc.id === schoolId)?.name ?? schoolId,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    return records
  }, [scoped])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Top Schools by Enrollment
          </h3>
          <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
            Top 10 schools by student count
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
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="min-w-[600px] w-full text-left">
          <thead>
            <tr>
              <th className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                School
              </th>
              <th className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                Enrollment
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {enrollmentBySchool.map((row) => (
              <tr key={row.schoolId}>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300 text-theme-sm">
                  {row.name}
                </td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300 text-theme-sm">
                  {row.count}
                </td>
              </tr>
            ))}
            {!enrollmentBySchool.length && (
              <tr>
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-theme-sm">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
