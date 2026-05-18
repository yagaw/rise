import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server"

type ExcelDataRecord = {
  id: string | number
  created_at?: string
  data_year?: string | number
  data_type?: string | number
  name?: string
  url?: string
}

type ParsedSummary = {
  rowCount: number
  fieldCount: number
  rows: Record<string, string | number | boolean | null>[]
}

const EXCEL_BUCKET = "excel_data"
const EXCEL_TABLE = "excel_data"
const SCHOOL_DATA_TYPE_ID = "1"
const TEACHER_DATA_TYPE_ID = "2"

const workbookCache = new Map<string, ParsedSummary>()

function hasValue(value: unknown) {
  if (value === null || value === undefined) return false
  if (typeof value === "string") return value.trim() !== ""
  return true
}

function normalizeCell(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined) return null
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed === "" ? null : trimmed
  }
  if (typeof value === "number" || typeof value === "boolean") return value
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function getCellText(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase()
}

function findColumn(columns: string[], candidates: string[]) {
  const normalizedColumns = new Map(
    columns.map((column) => [normalizeKey(column), column]),
  )

  for (const candidate of candidates) {
    const found = normalizedColumns.get(normalizeKey(candidate))
    if (found) return found
  }

  return null
}

function normalizeGender(value: unknown) {
  const text = getCellText(value).toLowerCase()
  if (!text) return "Unknown"
  if (["m", "male", "boy", "boys"].includes(text)) return "Male"
  if (["f", "female", "girl", "girls"].includes(text)) return "Female"
  return getCellText(value)
}

function isTruthyExcelValue(value: unknown) {
  const text = getCellText(value).toLowerCase()
  if (!text) return false
  return !["0", "no", "n", "false", "none", "-", "na", "n/a"].includes(text)
}

function countByColumn(
  rows: Record<string, string | number | boolean | null>[],
  columns: string[],
  candidates: string[],
  normalizer: (value: unknown) => string = (value) => getCellText(value),
) {
  const column = findColumn(columns, candidates)
  const counts: Record<string, number> = {}

  if (!column) return counts

  rows.forEach((row) => {
    const label = normalizer(row[column]) || "Unknown"
    counts[label] = (counts[label] ?? 0) + 1
  })

  return counts
}

function getStoragePathFromUrl(url: string) {
  const marker = `/storage/v1/object/public/${EXCEL_BUCKET}/`
  const markerIndex = url.indexOf(marker)

  if (markerIndex === -1) {
    return null
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length))
}

function getCacheKey(record: ExcelDataRecord) {
  return [record.id, record.created_at ?? "", record.url ?? ""].join(":")
}

function readWorkbook(buffer: ArrayBuffer) {
  return XLSX.read(new Uint8Array(buffer), {
    dense: true,
    type: "array",
  })
}

function parseSummary(buffer: ArrayBuffer): ParsedSummary {
  const workbook = readWorkbook(buffer)
  const sheetName = workbook.SheetNames[0]

  if (!sheetName) {
    return { rowCount: 0, fieldCount: 0, rows: [] }
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
    blankrows: false,
    defval: "",
    header: 1,
  })
  const headers = (rows[0] ?? [])
    .map((cell) => String(cell ?? "").trim())
    .filter(Boolean)
  const dataRows = rows
    .slice(1)
    .map((row) => {
      const record: Record<string, string | number | boolean | null> = {}

      headers.forEach((header, index) => {
        record[header] = normalizeCell(row[index])
      })

      return record
    })
    .filter((row) => Object.values(row).some((value) => hasValue(value)))

  return {
    rowCount: dataRows.length,
    fieldCount: headers.length,
    rows: dataRows,
  }
}

function getChartData(summary: ParsedSummary) {
  const columns = Object.keys(summary.rows[0] ?? {})
  const gender = countByColumn(
    summary.rows,
    columns,
    ["gender", "sex", "student_gender", "teacher_gender"],
    normalizeGender,
  )
  const grade = countByColumn(summary.rows, columns, [
    "grade",
    "grade_level",
    "gradeLevel",
    "class",
    "level",
    "std",
  ])
  const organization = countByColumn(summary.rows, columns, [
    "org",
    "organization",
    "organisation",
  ])
  const genderColumn = findColumn(columns, [
    "gender",
    "sex",
    "teacher_gender",
    "student_gender",
  ])
  const subjectColumns = [
    { label: "Math", candidates: ["math", "mathematics"] },
    { label: "Science", candidates: ["science", "sci"] },
    { label: "English", candidates: ["english", "eng"] },
    { label: "Burmese", candidates: ["burmese", "myanmar"] },
    { label: "History", candidates: ["history"] },
    { label: "Geography", candidates: ["geography"] },
    { label: "Physics", candidates: ["phy", "physics"] },
    { label: "Chemistry", candidates: ["che", "chemistry"] },
    { label: "Biology", candidates: ["bio", "biology"] },
  ]
  const subjects: Record<string, number> = {}
  const subjectsByGender: Record<
    string,
    { total: number; male: number; female: number }
  > = {}

  subjectColumns.forEach((subject) => {
    const column = findColumn(columns, subject.candidates)

    if (!column) {
      subjects[subject.label] = 0
      subjectsByGender[subject.label] = { total: 0, male: 0, female: 0 }
      return
    }

    const subjectRows = summary.rows.filter((row) =>
      isTruthyExcelValue(row[column]),
    )
    const male = genderColumn
      ? subjectRows.filter((row) => normalizeGender(row[genderColumn]) === "Male")
          .length
      : 0
    const female = genderColumn
      ? subjectRows.filter(
          (row) => normalizeGender(row[genderColumn]) === "Female",
        ).length
      : 0

    subjects[subject.label] = subjectRows.length
    subjectsByGender[subject.label] = {
      total: subjectRows.length,
      male,
      female,
    }
  })

  return { gender, grade, organization, subjects, subjectsByGender }
}

function getOrganizationNames(...summaries: ParsedSummary[]) {
  const names = new Set<string>()

  summaries.forEach((summary) => {
    Object.keys(getChartData(summary).organization).forEach((name) => {
      if (name) names.add(name)
    })
  })

  return Array.from(names).sort((a, b) => a.localeCompare(b))
}

function filterSummaryByOrganization(
  summary: ParsedSummary,
  organization: string,
): ParsedSummary {
  if (!organization || organization === "all") return summary

  const columns = Object.keys(summary.rows[0] ?? {})
  const organizationColumn = findColumn(columns, [
    "org",
    "organization",
    "organisation",
  ])

  if (!organizationColumn) {
    return { ...summary, rowCount: 0, rows: [] }
  }

  const rows = summary.rows.filter(
    (row) => getCellText(row[organizationColumn]) === organization,
  )

  return {
    ...summary,
    rowCount: rows.length,
    rows,
  }
}

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return Boolean(user)
}

function listExcelRecordsByType(records: ExcelDataRecord[], dataTypeId: string) {
  return records.filter((record) => String(record.data_type) === dataTypeId)
}

async function listExcelRecords(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  dataYearId: string,
) {
  const { data, error } = await supabase
    .from(EXCEL_TABLE)
    .select("id, created_at, data_year, data_type, name, url")
    .eq("data_year", dataYearId)

  if (error) {
    throw new Error(`Failed to list Excel data: ${error.message}`)
  }

  return (data ?? []) as ExcelDataRecord[]
}

async function downloadExcelFile(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  record: ExcelDataRecord,
) {
  if (!record.url) {
    throw new Error(`Excel record ${record.name ?? record.id} does not have a URL.`)
  }

  const storagePath = getStoragePathFromUrl(record.url)

  if (storagePath) {
    const { data, error } = await supabase.storage
      .from(EXCEL_BUCKET)
      .download(storagePath)

    if (!error) {
      return data.arrayBuffer()
    }
  }

  const response = await fetch(record.url, { cache: "no-store" })

  if (!response.ok) {
    throw new Error(`Failed to download ${record.name ?? "Excel file"}.`)
  }

  return response.arrayBuffer()
}

async function getExcelSummary(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  record: ExcelDataRecord | null,
) {
  if (!record) return { rowCount: 0, fieldCount: 0, rows: [], file: null, error: null }

  const cacheKey = getCacheKey(record)
  const cached = workbookCache.get(cacheKey)

  if (cached) {
    return { ...cached, file: record, error: null }
  }

  try {
    const buffer = await downloadExcelFile(supabase, record)
    const summary = parseSummary(buffer)
    workbookCache.set(cacheKey, summary)

    return { ...summary, file: record, error: null }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read Excel file."

    return { rowCount: 0, fieldCount: 0, rows: [], file: record, error: message }
  }
}

async function getCombinedExcelSummary(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  records: ExcelDataRecord[],
) {
  const summaries = await Promise.all(
    records.map((record) => getExcelSummary(supabase, record)),
  )
  const readableSummaries = summaries.filter((summary) => !summary.error)

  return {
    rowCount: readableSummaries.reduce(
      (total, summary) => total + summary.rowCount,
      0,
    ),
    fieldCount: readableSummaries.reduce(
      (total, summary) => total + summary.fieldCount,
      0,
    ),
    rows: readableSummaries.flatMap((summary) => summary.rows),
    files: records,
    errors: summaries
      .filter((summary) => summary.error)
      .map((summary) => ({
        file: summary.file,
        error: summary.error,
      })),
  }
}

function findStudentExcelRecords(records: ExcelDataRecord[]) {
  return records.filter((record) => {
    const name = getCellText(record.name).toLowerCase()
    return name.includes("student") || name.includes("tees")
  })
}

function toPublicSummary(
  summary: ParsedSummary & {
    files: ExcelDataRecord[]
    errors: Array<{ file: ExcelDataRecord | null; error: string | null }>
  },
) {
  return {
    rowCount: summary.rowCount,
    fieldCount: summary.fieldCount,
    files: summary.files,
    errors: summary.errors,
  }
}

export async function GET(request: Request) {
  if (!(await requireUser())) {
    return NextResponse.json(
      { error: "Authentication is required." },
      { status: 401 },
    )
  }

  const searchParams = new URL(request.url).searchParams
  const dataYearId = searchParams.get("data_year")?.trim()
  const organization = searchParams.get("organization")?.trim() || "all"

  if (!dataYearId) {
    return NextResponse.json({ error: "Data year is required." }, { status: 400 })
  }

  try {
    const supabase = createSupabaseAdminClient()
    const excelFiles = await listExcelRecords(supabase, dataYearId)
    const schoolRecords = listExcelRecordsByType(excelFiles, SCHOOL_DATA_TYPE_ID)
    const teacherRecords = listExcelRecordsByType(
      excelFiles,
      TEACHER_DATA_TYPE_ID,
    )
    const studentRecords = findStudentExcelRecords(excelFiles)
    const [schoolSummary, teacherSummary, studentSummary] = await Promise.all([
      getCombinedExcelSummary(supabase, schoolRecords),
      getCombinedExcelSummary(supabase, teacherRecords),
      getCombinedExcelSummary(supabase, studentRecords),
    ])
    const organizations = getOrganizationNames(
      schoolSummary,
      teacherSummary,
      studentSummary,
    )
    const filteredSchoolSummary = filterSummaryByOrganization(
      schoolSummary,
      organization,
    )
    const filteredTeacherSummary = filterSummaryByOrganization(
      teacherSummary,
      organization,
    )
    const filteredStudentSummary = filterSummaryByOrganization(
      studentSummary,
      organization,
    )
    const schoolChart = getChartData(filteredSchoolSummary)
    const teacherChart = getChartData(filteredTeacherSummary)
    const studentChart = getChartData(filteredStudentSummary)

    return NextResponse.json({
      dataYear: dataYearId,
      organization,
      organizations,
      excelFiles,
      schools: toPublicSummary(schoolSummary),
      teachers: toPublicSummary(teacherSummary),
      students: toPublicSummary(studentSummary),
      charts: {
        teacherGender: teacherChart.gender,
        studentGender: studentChart.gender,
        studentsByGrade: studentChart.grade,
        teachersBySubject: teacherChart.subjects,
        teachersBySubjectGender: teacherChart.subjectsByGender,
        educationByOrganization: Array.from(
          new Set([
            ...Object.keys(schoolChart.organization),
            ...Object.keys(teacherChart.organization),
            ...Object.keys(studentChart.organization),
          ]),
        ).map((name) => ({
          name,
          schools: schoolChart.organization[name] ?? 0,
          teachers: teacherChart.organization[name] ?? 0,
          students: studentChart.organization[name] ?? 0,
        })),
      },
      totals: {
        excelFiles: excelFiles.length,
        rows:
          filteredSchoolSummary.rowCount +
          filteredTeacherSummary.rowCount +
          filteredStudentSummary.rowCount,
        fields:
          schoolSummary.fieldCount +
          teacherSummary.fieldCount +
          studentSummary.fieldCount,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load Excel analytics."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
