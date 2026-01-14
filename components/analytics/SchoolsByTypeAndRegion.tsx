"use client"
import React, { useMemo, useState } from "react"
import {
  organizations,
  getOrganizationScopedData,
  schools as allSchools,
} from "@/data/education"

export default function SchoolsByTypeAndRegion() {
  const [organizationId, setOrganizationId] = useState<string>("all")
  const scoped = useMemo(
    () => getOrganizationScopedData(organizationId),
    [organizationId]
  )

  const schoolStats = useMemo(() => {
    const byType: Record<string, number> = {}
    const byRegion: Record<string, number> = {}
    const byStatus: Record<string, number> = {}

    scoped.schools.forEach((s) => {
      const type = s.sch_type || "Unknown"
      const region = s.sr_eng_mimu || "Unknown"
      const status = s.sch_status || "Unknown"

      byType[type] = (byType[type] || 0) + 1
      byRegion[region] = (byRegion[region] || 0) + 1
      byStatus[status] = (byStatus[status] || 0) + 1
    })

    return { byType, byRegion, byStatus }
  }, [scoped.schools])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Schools Overview
          </h3>
          <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
            Distribution by type, region, and status
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* By Type */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            By Type
          </h4>
          <div className="space-y-2">
            {Object.entries(schoolStats.byType).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {type}
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By Region */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            By Region
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {Object.entries(schoolStats.byRegion)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([region, count]) => (
                <div
                  key={region}
                  className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {region}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* By Status */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            By Status
          </h4>
          <div className="space-y-2">
            {Object.entries(schoolStats.byStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {status}
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
