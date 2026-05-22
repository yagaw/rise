"use client"

import { useExcelAnalytics } from "./useExcelAnalytics"

type Props = {
  dataYearId?: string
  organization?: string
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

export default function StudentSourceBreakdown({
  dataYearId,
  organization = "all",
}: Props) {
  const { data, loading } = useExcelAnalytics(organization, dataYearId, "be")
  const sources = data?.charts?.studentSources ?? [
    { id: "15", label: "NFE", rowCount: 0, fileCount: 0, gender: {} },
    { id: "16", label: "TEES", rowCount: 0, fileCount: 0, gender: {} },
    {
      id: "17",
      label: "Women Literacy",
      rowCount: 0,
      fileCount: 0,
      gender: {},
    },
  ]
  const total = sources.reduce((sum, source) => sum + source.rowCount, 0)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          BE Students by Program
        </h3>
        <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
          NFE, TEES, and Women Literacy student Excel data
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : !dataYearId ? (
        <div className="flex h-44 items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Select a data year to view student analysis
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sources.map((source) => {
            const maleCount = source.gender?.Male ?? 0
            const femaleCount = source.gender?.Female ?? 0
            const genderTotal = maleCount + femaleCount
            const displayTotal = genderTotal || source.rowCount
            const percentage = total > 0 ? (source.rowCount / total) * 100 : 0

            return (
              <div key={source.id}>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {source.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {source.fileCount} file{source.fileCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {formatNumber(displayTotal)}
                  </p>
                </div>
                <div className="mb-2 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                  Male {formatNumber(maleCount)} + Female{" "}
                  {formatNumber(femaleCount)} = Total{" "}
                  {formatNumber(displayTotal)}
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
