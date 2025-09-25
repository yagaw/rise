"use client"
import React, { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import * as XLSX from "xlsx"
import { organizations, schools, teachers, students } from "@/data/education"

type SheetType = "students" | "teachers" | "schools"

function buildTemplate(sheet: SheetType) {
  if (sheet === "students") {
    return [
      ["fullName", "schoolId", "gradeLevel", "gender (male|female)"],
      ...students
        .slice(0, 5)
        .map((s) => [s.fullName, s.schoolId, s.gradeLevel, s.gender]),
    ]
  }
  if (sheet === "teachers") {
    return [
      ["fullName", "schoolId", "subject", "gender (male|female)"],
      ...teachers
        .slice(0, 5)
        .map((t) => [t.fullName, t.schoolId, t.subject ?? "", t.gender]),
    ]
  }
  return [
    ["name", "organizationId"],
    ...schools.slice(0, 5).map((s) => [s.name, s.organizationId]),
  ]
}

export default function ImportExportPage() {
  const [sheetType, setSheetType] = useState<SheetType>("students")
  type RowRecord = Record<string, string | number | boolean>
  const [rows, setRows] = useState<RowRecord[]>([])
  const [error, setError] = useState<string>("")

  // (Manual entry moved to dedicated pages: /students and /teachers)

  const handleDownload = useCallback(() => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(buildTemplate(sheetType))
    XLSX.utils.book_append_sheet(wb, ws, sheetType)
    XLSX.writeFile(wb, `${sheetType}-template.xlsx`)
  }, [sheetType])

  const onFile = useCallback((file: File) => {
    setError("")
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<RowRecord>(ws, { defval: "" })
      setRows(json)
    }
    reader.onerror = () => setError("Failed to read file")
    reader.readAsArrayBuffer(file)
  }, [])

  const sampleCounts = useMemo(() => {
    return {
      organizations: organizations.length,
      schools: schools.length,
      teachers: teachers.length,
      students: students.length,
    }
  }, [])

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Import / Export
              </h3>
              <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                Excel templates and import for students, teachers, and schools
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-theme-sm text-gray-600 dark:text-gray-300">
                Sheet
              </label>
              <select
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                value={sheetType}
                onChange={(e) => setSheetType(e.target.value as SheetType)}
              >
                <option value="students">Students</option>
                <option value="teachers">Teachers</option>
                <option value="schools">Schools</option>
              </select>
              <button
                onClick={handleDownload}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                Download template
              </button>
              <label className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] cursor-pointer">
                Upload Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) onFile(f)
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links to dedicated insert forms */}
      <div className="col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Manual Entry
            </h4>
          </div>
          <p className="mb-4 text-theme-sm text-gray-500 dark:text-gray-400">
            Use the dedicated pages below to add or edit records.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/students"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Go to Students insert form
            </Link>
            <Link
              href="/teachers"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Go to Teachers insert form
            </Link>
          </div>
        </div>
      </div>
      <div className="col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h4 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
            Dataset Overview
          </h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                Organizations
              </p>
              <p className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {sampleCounts.organizations}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                Schools
              </p>
              <p className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {sampleCounts.schools}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                Teachers
              </p>
              <p className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {sampleCounts.teachers}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                Students
              </p>
              <p className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {sampleCounts.students}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Preview
            </h4>
            {error && <span className="text-error-600 text-sm">{error}</span>}
          </div>
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <table className="min-w-[700px] w-full text-left">
              <thead>
                <tr>
                  {rows[0] &&
                    Object.keys(rows[0]).map((k) => (
                      <th
                        key={k}
                        className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 border-b border-gray-100 dark:border-gray-800"
                      >
                        {k}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {rows.slice(0, 20).map((r, idx) => (
                  <tr key={idx}>
                    {Object.keys(rows[0] ?? {}).map((k) => (
                      <td
                        key={k}
                        className="px-3 py-2 text-gray-700 dark:text-gray-300 text-theme-sm"
                      >
                        {String(r[k])}
                      </td>
                    ))}
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-theme-sm">
                      No data. Upload an Excel file to preview.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
