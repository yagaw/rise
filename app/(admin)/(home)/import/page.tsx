"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as XLSX from "xlsx"
import { DataYear } from "@/types/dataYear"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type DatabaseType =
  | "schools"
  | "school_qle"
  | "teachers"
  | "eccd_students"
  | "tees_students"

type RowRecord = Record<string, string | number | boolean | null>

/* ------------------------------------------------------------------ */
/*  Per-database config                                                */
/* ------------------------------------------------------------------ */

const DATABASE_OPTIONS: { value: DatabaseType; label: string }[] = [
  { value: "schools", label: "Schools" },
  { value: "school_qle", label: "School QLE" },
  { value: "teachers", label: "Teachers" },
  { value: "eccd_students", label: "ECCD Students" },
  { value: "tees_students", label: "TEES Students" },
]

const API_ENDPOINTS: Record<DatabaseType, string> = {
  schools: "/api/schools",
  school_qle: "/api/school-qle",
  teachers: "/api/teachers",
  eccd_students: "/api/eccd",
  tees_students: "/api/tees",
}

/** Expected columns per database – drives template downloads & payload keys */
const EXPECTED_COLUMNS: Record<DatabaseType, string[]> = {
  schools: ["data_year", "sch_code", "sch_name_eng", "sch_name_bur", "org"],
  school_qle: [
    "data_year",
    "sch_code",
    "sch_name_eng",
    "sr_eng_minu",
    "ts_eng_mimu",
    "sch_type",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
  ],
  teachers: [
    "data_year",
    "teach_id",
    "teach_name_eng",
    "sch_code",
    "position",
    "gender",
  ],
  eccd_students: [
    "data_year",
    "std_id",
    "std_name_eng",
    "std_name_bur",
    "sex",
    "dob",
    "enroll_date",
    "age",
    "org",
    "sch_code",
    "sch_name_eng",
  ],
  tees_students: [
    "data_year",
    "std_id",
    "std_name_eng",
    "std_name_bur",
    "sex",
    "dob",
    "enroll_date",
    "age",
    "year_tees_std_began",
    "org",
    "sch_code",
    "sch_name_eng",
  ],
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function hasMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === "string") return value.trim() !== ""
  return true
}

function normalizePayloadValue(
  value: string | number | boolean | null | undefined,
) {
  if (value === undefined || value === null) return null
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed === "" ? null : trimmed
  }
  return value
}

/**
 * Minimum number of non-empty fields a row must have to be considered real data.
 * Empty styled rows in Excel often produce 1-2 stale values (e.g. 0 in
 * number-formatted columns). Real data rows always have many more fields.
 */
const MIN_POPULATED_FIELDS = 3

const SHEET_NAME_HINTS: Record<DatabaseType, string[]> = {
  schools: ["school"],
  school_qle: ["qle", "quality", "learning"],
  teachers: ["teacher"],
  eccd_students: ["eccd"],
  tees_students: ["tees"],
}

function pickSheetName(
  wb: XLSX.WorkBook,
  selectedDb: DatabaseType,
): string | null {
  const workbookSheets = wb.Workbook?.Sheets as
    | Array<{ name?: string; Hidden?: number }>
    | undefined
  const hiddenByName = new Map<string, number>()

  workbookSheets?.forEach((sheet) => {
    if (sheet?.name) hiddenByName.set(sheet.name, Number(sheet.Hidden ?? 0))
  })

  // Prefer visible sheets to avoid importing hidden helper tabs.
  const visible = wb.SheetNames.filter(
    (name) => (hiddenByName.get(name) ?? 0) === 0,
  )
  const candidates = visible.length > 0 ? visible : wb.SheetNames
  if (candidates.length === 0) return null

  const hints = SHEET_NAME_HINTS[selectedDb]
  const matched = candidates.find((name) => {
    const n = name.toLowerCase()
    return hints.some((hint) => n.includes(hint))
  })

  return matched ?? candidates[0] ?? null
}

function parseExcelFile(
  buffer: ArrayBuffer,
  selectedDb: DatabaseType,
): RowRecord[] {
  const data = new Uint8Array(buffer)
  const wb = XLSX.read(data, { type: "array" })
  const sheetName = pickSheetName(wb, selectedDb)
  if (!sheetName) throw new Error("No worksheet found in file")
  const ws = wb.Sheets[sheetName]
  if (!ws) throw new Error("Unable to read worksheet")

  // Parse without defval so empty cells are omitted from each row object.
  const json = XLSX.utils.sheet_to_json<RowRecord>(ws)

  // Keep only rows with enough real values.  Empty styled rows may carry
  // 1-2 stale zeros from number-formatted columns — those are discarded.
  return json.filter((row) => {
    const populated = Object.values(row).filter((v) => hasMeaningfulValue(v))
    return populated.length >= MIN_POPULATED_FIELDS
  })
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function ImportPage() {
  /* ---- state ---- */
  const [selectedDb, setSelectedDb] = useState<DatabaseType>("schools")
  const [dataYears, setDataYears] = useState<DataYear[]>([])
  const [selectedDataYear, setSelectedDataYear] = useState("")
  const [dataYearSearch, setDataYearSearch] = useState("")
  const [isDataYearOpen, setIsDataYearOpen] = useState(false)
  const dataYearRef = useRef<HTMLDivElement>(null)

  const [rows, setRows] = useState<RowRecord[]>([])
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [progress, setProgress] = useState({ processed: 0, total: 0 })
  const [summary, setSummary] = useState<{
    total: number
    success: number
    failed: number
    errors: string[]
  } | null>(null)

  /* ---- fetch data years ---- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/data_year")
        if (!res.ok) return
        const data = (await res.json()) as DataYear[]
        setDataYears(data)
        if (data.length > 0) setSelectedDataYear((p) => p || data[0].id)
      } catch {
        /* ignore */
      }
    }
    load()
  }, [])

  /* ---- close data year dropdown on outside click ---- */
  useEffect(() => {
    if (!isDataYearOpen) return
    const handler = (e: MouseEvent) => {
      if (
        dataYearRef.current &&
        !dataYearRef.current.contains(e.target as Node)
      ) {
        setIsDataYearOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isDataYearOpen])

  /* ---- reset file/rows when database changes ---- */
  useEffect(() => {
    setRows([])
    setFileName("")
    setError("")
    setSummary(null)
    setProgress({ processed: 0, total: 0 })
  }, [selectedDb])

  /* ---- derived ---- */
  const columns = EXPECTED_COLUMNS[selectedDb]

  const selectedDataYearLabel = useMemo(() => {
    if (!selectedDataYear) return "Select data year"
    const found = dataYears.find((d) => d.id === selectedDataYear)
    return found?.title || found?.id || selectedDataYear
  }, [dataYears, selectedDataYear])

  const filteredDataYears = useMemo(() => {
    const q = dataYearSearch.trim().toLowerCase()
    if (!q) return dataYears
    return dataYears.filter((d) => {
      const t = (d.title || "").toLowerCase()
      return t.includes(q) || d.id.toLowerCase().includes(q)
    })
  }, [dataYearSearch, dataYears])

  const dbLabel =
    DATABASE_OPTIONS.find((o) => o.value === selectedDb)?.label ?? selectedDb

  /* ---- file handling ---- */
  const processFile = useCallback(
    (file: File) => {
      setError("")
      setSummary(null)
      const lower = file.name.toLowerCase()
      if (![".xlsx", ".xls"].some((ext) => lower.endsWith(ext))) {
        setRows([])
        setFileName("")
        setError("Invalid file type. Please upload an .xlsx or .xls file.")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const buf = e.target?.result
          if (!buf) throw new Error("Empty file content")
          let parsed = parseExcelFile(buf as ArrayBuffer, selectedDb)

          // Force selected data year onto every imported row.
          parsed = parsed.map((row) => {
            if (!selectedDataYear) return row
            return { ...row, data_year: selectedDataYear }
          })

          setRows(parsed)
          setFileName(file.name)
          setError("")
        } catch (err) {
          console.error(err)
          setRows([])
          setFileName("")
          setError("Failed to parse Excel file. Please check file format.")
        }
      }
      reader.onerror = () => setError("Failed to read file")
      reader.readAsArrayBuffer(file)
    },
    [selectedDataYear, selectedDb],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f) processFile(f)
      e.target.value = ""
    },
    [processFile],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragActive(false)
      const f = e.dataTransfer.files?.[0]
      if (f) processFile(f)
    },
    [processFile],
  )

  /* ---- update data_year in loaded rows when selection changes ---- */
  useEffect(() => {
    if (!selectedDataYear || rows.length === 0) return
    setRows((prev) =>
      prev.map((row) => ({ ...row, data_year: selectedDataYear })),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataYear])

  /* ---- save to database ---- */
  const handleSave = useCallback(async () => {
    if (!rows.length) {
      setError("No data to import. Upload an Excel file first.")
      return
    }

    const endpoint = API_ENDPOINTS[selectedDb]
    const urlObj = new URL(endpoint, window.location.origin)
    urlObj.searchParams.set("allow_null_import", "1")
    const url = urlObj.toString()

    setIsSaving(true)
    setError("")
    setSummary(null)
    setProgress({ processed: 0, total: rows.length })

    let success = 0
    const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const payload: Record<string, unknown> = {}

      // Build payload from expected columns — missing fields become null
      for (const col of columns) {
        payload[col] = normalizePayloadValue(
          row[col] as string | number | boolean | null | undefined,
        )
      }
      // Also include any extra columns present in the Excel
      for (const key of Object.keys(row)) {
        if (!(key in payload)) {
          payload[key] = normalizePayloadValue(
            row[key] as string | number | boolean | null | undefined,
          )
        }
      }

      if (selectedDataYear) {
        payload.data_year = selectedDataYear
      }

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          let msg = "Row " + (i + 1) + ": Import failed"
          try {
            const body = (await res.json()) as { error?: string }
            if (body.error) msg = "Row " + (i + 1) + ": " + body.error
          } catch {
            /* use default msg */
          }
          errors.push(msg)
        } else {
          success++
        }
      } catch (netErr) {
        const m = netErr instanceof Error ? netErr.message : "Network error"
        errors.push("Row " + (i + 1) + ": " + m)
      }

      setProgress((p) => ({ ...p, processed: i + 1 }))
    }

    const failed = rows.length - success
    setSummary({
      total: rows.length,
      success,
      failed,
      errors: errors.slice(0, 10),
    })
    if (failed > 0) setError("Some rows failed to import. See summary below.")
    setIsSaving(false)
  }, [columns, rows, selectedDataYear, selectedDb])

  /* ---- template download ---- */
  const handleDownloadTemplate = useCallback(() => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([columns])
    XLSX.utils.book_append_sheet(wb, ws, selectedDb)
    XLSX.writeFile(wb, selectedDb + "-template.xlsx")
  }, [columns, selectedDb])

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  const progressPct =
    progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* ---- Header card ---- */}
      <div className="col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Import Data
          </h3>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            Select a database, choose data year, upload an Excel file, and save
            to the database.
          </p>
        </div>
      </div>

      {/* ---- Step 1 & 2: Database + Data Year selectors ---- */}
      <div className="col-span-12 lg:col-span-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Step 1 — Select Database
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {DATABASE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedDb(opt.value)}
                className={
                  "rounded-lg border px-4 py-3 text-sm font-medium transition-colors " +
                  (selectedDb === opt.value
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-400"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Step 2 — Select Data Year
          </label>
          <div className="relative" ref={dataYearRef}>
            <button
              type="button"
              onClick={() => setIsDataYearOpen((p) => !p)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-left text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {selectedDataYearLabel}
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                ▾
              </span>
            </button>
            {isDataYearOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900">
                <input
                  type="text"
                  placeholder="Search data year..."
                  className="mb-2 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  value={dataYearSearch}
                  onChange={(e) => setDataYearSearch(e.target.value)}
                />
                <div className="max-h-56 overflow-y-auto">
                  {filteredDataYears.length > 0 ? (
                    filteredDataYears.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedDataYear(item.id)
                          setIsDataYearOpen(false)
                          setDataYearSearch("")
                        }}
                        className={
                          "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/5 " +
                          (selectedDataYear === item.id
                            ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                            : "text-gray-700 dark:text-gray-300")
                        }
                      >
                        <span>{item.title || item.id}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.id}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No data year found.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- Step 3: Upload Excel ---- */}
      <div className="col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Step 3 — Upload {dbLabel} Excel File
            </label>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Download {dbLabel} Template
            </button>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragActive(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDragActive(false)
            }}
            className={
              "rounded-xl border-2 border-dashed p-8 text-center transition-colors " +
              (isDragActive
                ? "border-brand-400 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-500/10"
                : "border-gray-300 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/40")
            }
          >
            <svg
              className="mx-auto mb-2 h-10 w-10 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              Drag and drop your{" "}
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                {dbLabel}
              </span>{" "}
              Excel file here
            </p>
            <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
              Supports .xlsx and .xls
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Browse file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileInput}
            />
            {fileName && (
              <p className="mt-3 text-sm text-brand-600 dark:text-brand-400">
                ✓ {fileName} — {rows.length} rows loaded
              </p>
            )}
          </div>

          {error && !isSaving && !summary && (
            <p className="mt-3 text-sm text-error-600 dark:text-error-400">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* ---- Step 4: Preview & Save ---- */}
      {rows.length > 0 && (
        <div className="col-span-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  Step 4 — Preview &amp; Save
                </h4>
                <p className="text-theme-sm text-gray-500 dark:text-gray-400">
                  {rows.length} rows ready to import into{" "}
                  <span className="font-medium">{dbLabel}</span>
                  {selectedDataYear && (
                    <span>
                      {" "}
                      · Data Year:{" "}
                      <span className="font-medium">
                        {selectedDataYearLabel}
                      </span>
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : "Save " + rows.length + " Rows to Database"}
              </button>
            </div>

            {/* Progress bar */}
            {isSaving && (
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>Importing to {dbLabel}...</span>
                  <span>
                    {progress.processed} / {progress.total} ({progressPct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-200"
                    style={{ width: progressPct + "%" }}
                  />
                </div>
              </div>
            )}

            {/* Import result summary */}
            {summary && (
              <div
                className={
                  "mb-4 rounded-lg border p-4 text-sm " +
                  (summary.failed === 0
                    ? "border-success-300 bg-success-50 dark:border-success-500/30 dark:bg-success-500/10"
                    : "border-error-300 bg-error-50 dark:border-error-500/30 dark:bg-error-500/10")
                }
              >
                <p className="font-medium text-gray-800 dark:text-white/90">
                  Import Complete
                </p>
                <p className="mt-1 text-gray-700 dark:text-gray-300">
                  Total: {summary.total} · Success:{" "}
                  <span className="font-semibold text-success-600 dark:text-success-400">
                    {summary.success}
                  </span>{" "}
                  · Failed:{" "}
                  <span className="font-semibold text-error-600 dark:text-error-400">
                    {summary.failed}
                  </span>
                </p>
                {summary.errors.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-error-600 dark:text-error-400">
                    {summary.errors.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                    {summary.failed > summary.errors.length && (
                      <li className="text-gray-500">
                        ... and {summary.failed - summary.errors.length} more
                        errors
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}

            {/* Data table preview */}
            <div className="max-w-full overflow-x-auto custom-scrollbar">
              <table className="min-w-[700px] w-full text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-gray-400 text-theme-xs border-b border-gray-100 dark:border-gray-800">
                      #
                    </th>
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
                  {rows.slice(0, 50).map((r, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-gray-400 text-theme-xs">
                        {idx + 1}
                      </td>
                      {Object.keys(rows[0] ?? {}).map((k) => (
                        <td
                          key={k}
                          className={
                            "px-3 py-2 text-theme-sm " +
                            (r[k] == null
                              ? "text-gray-400 italic"
                              : "text-gray-700 dark:text-gray-300")
                          }
                        >
                          {r[k] != null ? String(r[k]) : "NULL"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 50 && (
                <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  Showing first 50 of {rows.length} rows
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
