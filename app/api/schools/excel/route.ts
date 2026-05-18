import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server"

type ExcelRow = Record<string, string | number | boolean | null>

type ParsedWorkbook = {
  columns: string[]
  rows: ExcelRow[]
}

type ExcelDataRecord = {
  id: string | number
  created_at?: string
  data_year?: string | number
  data_type?: string | number
  name?: string
  url?: string
}

const EXCEL_BUCKET = "excel_data"
const EXCEL_TABLE = "excel_data"
const SCHOOL_DATA_TYPE_ID = "1"

const workbookCache = new Map<
  string,
  {
    columns: string[]
    rows: ExcelRow[]
  }
>()

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

  if (typeof value === "number" || typeof value === "boolean") {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return String(value)
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

function repairZipCentralDirectorySizes(buffer: ArrayBuffer) {
  const original = Buffer.from(buffer)
  const repaired = Buffer.from(original)
  let changed = false
  const centralDirectoryOffsets: number[] = []
  let offset = 0

  while ((offset = original.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]), offset)) !== -1) {
    if (offset + 46 > original.length) break
    centralDirectoryOffsets.push(offset)
    const fileNameLength = original.readUInt16LE(offset + 28)
    const extraFieldLength = original.readUInt16LE(offset + 30)
    const fileCommentLength = original.readUInt16LE(offset + 32)
    offset += 46 + fileNameLength + extraFieldLength + fileCommentLength
  }

  const localHeaderOffsets = centralDirectoryOffsets
    .map((centralDirectoryOffset) => ({
      centralDirectoryOffset,
      localHeaderOffset: original.readUInt32LE(centralDirectoryOffset + 42),
    }))
    .sort((a, b) => a.localHeaderOffset - b.localHeaderOffset)

  localHeaderOffsets.forEach((entry, index) => {
    const { centralDirectoryOffset, localHeaderOffset } = entry

    if (centralDirectoryOffset + 46 > original.length) return
    if (localHeaderOffset + 30 > original.length) return
    if (original.readUInt32LE(localHeaderOffset) !== 0x04034b50) return

    const centralCrc = original.readUInt32LE(centralDirectoryOffset + 16)
    const centralCompressedSize = original.readUInt32LE(centralDirectoryOffset + 20)
    const centralUncompressedSize = original.readUInt32LE(centralDirectoryOffset + 24)
    const flags = original.readUInt16LE(localHeaderOffset + 6)
    const localCrc = original.readUInt32LE(localHeaderOffset + 14)
    const localCompressedSize = original.readUInt32LE(localHeaderOffset + 18)
    const localUncompressedSize = original.readUInt32LE(localHeaderOffset + 22)
    const localFileNameLength = original.readUInt16LE(localHeaderOffset + 26)
    const localExtraFieldLength = original.readUInt16LE(localHeaderOffset + 28)
    const localDataOffset =
      localHeaderOffset + 30 + localFileNameLength + localExtraFieldLength

    let repairedCrc = localCrc
    let repairedCompressedSize = localCompressedSize
    let repairedUncompressedSize = localUncompressedSize

    if (
      (flags & 8) !== 0 &&
      repairedCompressedSize === 0 &&
      localDataOffset < original.length
    ) {
      const nextLocalHeaderOffset =
        localHeaderOffsets[index + 1]?.localHeaderOffset ??
        centralDirectoryOffsets[0] ??
        original.length
      const descriptorSearchEnd = Math.min(nextLocalHeaderOffset, original.length)
      const descriptorSignature = Buffer.from([0x50, 0x4b, 0x07, 0x08])
      const descriptorOffset = original.indexOf(
        descriptorSignature,
        localDataOffset,
      )

      if (
        descriptorOffset !== -1 &&
        descriptorOffset + 16 <= descriptorSearchEnd
      ) {
        repairedCrc = original.readUInt32LE(descriptorOffset + 4)
        repairedCompressedSize = original.readUInt32LE(descriptorOffset + 8)
        repairedUncompressedSize = original.readUInt32LE(descriptorOffset + 12)
      } else if (descriptorSearchEnd > localDataOffset) {
        repairedCompressedSize = descriptorSearchEnd - localDataOffset
      }
    }

    if (centralCompressedSize === 0 && repairedCompressedSize > 0) {
      repaired.writeUInt32LE(repairedCompressedSize, centralDirectoryOffset + 20)
      changed = true
    }

    if (centralUncompressedSize === 0 && repairedUncompressedSize > 0) {
      repaired.writeUInt32LE(
        repairedUncompressedSize,
        centralDirectoryOffset + 24,
      )
      changed = true
    }

    if (centralCrc === 0 && repairedCrc > 0) {
      repaired.writeUInt32LE(repairedCrc, centralDirectoryOffset + 16)
      changed = true
    }
  })

  return changed ? repaired.buffer.slice(repaired.byteOffset, repaired.byteOffset + repaired.byteLength) : buffer
}

function readWorkbook(buffer: ArrayBuffer) {
  const repairedBuffer = repairZipCentralDirectorySizes(buffer)
  const buffers =
    repairedBuffer === buffer ? [buffer] : [buffer, repairedBuffer]
  const attempts = [
    ...buffers.map((candidateBuffer) => () =>
      XLSX.read(new Uint8Array(candidateBuffer), {
        dense: true,
        type: "array",
      }),
    ),
    ...buffers.map((candidateBuffer) => () =>
      XLSX.read(Buffer.from(candidateBuffer), {
        dense: true,
        type: "buffer",
      }),
    ),
    ...buffers.map((candidateBuffer) => () =>
      XLSX.read(Buffer.from(candidateBuffer).toString("binary"), {
        dense: true,
        type: "binary",
      }),
    ),
  ]

  let lastError: unknown

  for (const attempt of attempts) {
    try {
      return attempt()
    } catch (error) {
      lastError = error
    }
  }

  const detail = lastError instanceof Error ? lastError.message : "Unknown error"
  throw new Error(
    `The selected School Excel file could not be read. Please re-save it as a valid .xlsx file and upload it again. Parser error: ${detail}`,
  )
}

function parseWorkbook(buffer: ArrayBuffer): ParsedWorkbook {
  const workbook = readWorkbook(buffer)
  const sheetName = workbook.SheetNames[0]

  if (!sheetName) {
    throw new Error("The Excel file does not contain any worksheets.")
  }

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    blankrows: false,
    defval: "",
    header: 1,
  })

  const headerRow = rows[0] ?? []
  const columnCounts = new Map<string, number>()
  const columns = headerRow
    .map((cell) => String(cell ?? "").trim())
    .filter((cell) => cell !== "")
    .map((column) => {
      const count = columnCounts.get(column) ?? 0
      columnCounts.set(column, count + 1)

      return count === 0 ? column : `${column}_${count + 1}`
    })

  if (columns.length === 0) {
    throw new Error("The Excel file does not contain a header row.")
  }

  const dataRows = rows
    .slice(1)
    .map((row) => {
      const record: ExcelRow = {}

      columns.forEach((column, index) => {
        record[column] = normalizeCell(row[index])
      })

      return record
    })
    .filter((row) => Object.values(row).some((value) => hasValue(value)))

  return { columns, rows: dataRows }
}

async function findSchoolExcelRecord(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  dataYearId: string,
) {
  const { data, error } = await supabase
    .from(EXCEL_TABLE)
    .select("id, created_at, data_year, data_type, name, url")
    .eq("data_year", dataYearId)
    .eq("data_type", SCHOOL_DATA_TYPE_ID)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to find school Excel file: ${error.message}`)
  }

  return data as ExcelDataRecord | null
}

async function listSchoolExcelRecords(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  dataYearId: string,
) {
  const { data, error } = await supabase
    .from(EXCEL_TABLE)
    .select("id, created_at, data_year, data_type, name, url")
    .eq("data_year", dataYearId)
    .eq("data_type", SCHOOL_DATA_TYPE_ID)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to load school Excel files: ${error.message}`)
  }

  return (data ?? []) as ExcelDataRecord[]
}

async function findSchoolExcelRecordById(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  dataYearId: string,
  excelFileId: string,
) {
  const { data, error } = await supabase
    .from(EXCEL_TABLE)
    .select("id, created_at, data_year, data_type, name, url")
    .eq("id", excelFileId)
    .eq("data_year", dataYearId)
    .eq("data_type", SCHOOL_DATA_TYPE_ID)
    .single()

  if (error) {
    throw new Error(`Failed to find school Excel file: ${error.message}`)
  }

  return data as ExcelDataRecord
}

async function downloadExcelFile(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  record: ExcelDataRecord,
) {
  if (!record.url) {
    throw new Error("The school Excel record does not have a file URL.")
  }

  const storagePath = getStoragePathFromUrl(record.url)

  if (storagePath) {
    const { data, error } = await supabase.storage
      .from(EXCEL_BUCKET)
      .download(storagePath)

    if (error) {
      throw new Error(`Failed to download Excel file: ${error.message}`)
    }

    return { buffer: await data.arrayBuffer(), storagePath }
  }

  const response = await fetch(record.url, { cache: "no-store" })

  if (response.ok) {
    return { buffer: await response.arrayBuffer(), storagePath: null }
  }

  throw new Error("Failed to download Excel file from its URL.")
}

function buildWorkbook(columns: string[], rows: ExcelRow[]) {
  const worksheetRows = [
    columns,
    ...rows.map((row) => columns.map((column) => row[column] ?? "")),
  ]
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows)

  XLSX.utils.book_append_sheet(workbook, worksheet, "Schools")

  return XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  }) as Buffer
}

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  return true
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
  const excelFileId = searchParams.get("excel_file_id")?.trim()
  const listOnly = searchParams.get("list") === "1"

  if (!dataYearId) {
    return NextResponse.json({ error: "Data year is required." }, { status: 400 })
  }

  try {
    const supabase = createSupabaseAdminClient()

    if (listOnly) {
      const records = await listSchoolExcelRecords(supabase, dataYearId)
      return NextResponse.json({ excelFiles: records })
    }

    const record = excelFileId
      ? await findSchoolExcelRecordById(supabase, dataYearId, excelFileId)
      : await findSchoolExcelRecord(supabase, dataYearId)

    if (!record) {
      return NextResponse.json(
        { error: "No school Excel file found for the selected data year." },
        { status: 404 },
      )
    }

    const cacheKey = getCacheKey(record)
    const cachedWorkbook = workbookCache.get(cacheKey)

    if (cachedWorkbook) {
      return NextResponse.json({
        excelFile: record,
        columns: cachedWorkbook.columns,
        rows: cachedWorkbook.rows,
      })
    }

    const { buffer } = await downloadExcelFile(supabase, record)
    const parsed = parseWorkbook(buffer)

    workbookCache.set(cacheKey, parsed)

    return NextResponse.json({
      excelFile: record,
      columns: parsed.columns,
      rows: parsed.rows,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load school Excel file."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await requireUser())) {
    return NextResponse.json(
      { error: "Authentication is required." },
      { status: 401 },
    )
  }

  const body = (await request.json()) as {
    excelFileId?: string
    columns?: unknown
    rows?: unknown
  }

  if (!body.excelFileId) {
    return NextResponse.json({ error: "Excel file ID is required." }, { status: 400 })
  }

  if (!Array.isArray(body.columns) || !body.columns.every((item) => typeof item === "string")) {
    return NextResponse.json({ error: "Columns must be a string array." }, { status: 400 })
  }

  if (!Array.isArray(body.rows)) {
    return NextResponse.json({ error: "Rows must be an array." }, { status: 400 })
  }

  const columns = body.columns.map((column) => column.trim()).filter(Boolean)

  if (columns.length === 0) {
    return NextResponse.json({ error: "At least one column is required." }, { status: 400 })
  }

  const rows = body.rows.map((row) => {
    const record: ExcelRow = {}

    if (row && typeof row === "object" && !Array.isArray(row)) {
      columns.forEach((column) => {
        record[column] = normalizeCell((row as Record<string, unknown>)[column])
      })
    }

    return record
  })

  try {
    const supabase = createSupabaseAdminClient()
    const { data: record, error } = await supabase
      .from(EXCEL_TABLE)
      .select("*")
      .eq("id", body.excelFileId)
      .single()

    if (error) {
      throw new Error(`Failed to find Excel file record: ${error.message}`)
    }

    const excelRecord = record as ExcelDataRecord
    const storagePath = getStoragePathFromUrl(excelRecord.url ?? "")

    if (!storagePath) {
      throw new Error("The Excel file URL is not a Supabase Storage public URL.")
    }

    const workbookBuffer = buildWorkbook(columns, rows)
    const { error: uploadError } = await supabase.storage
      .from(EXCEL_BUCKET)
      .upload(storagePath, workbookBuffer, {
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Failed to save Excel file: ${uploadError.message}`)
    }

    workbookCache.set(getCacheKey(excelRecord), { columns, rows })

    return NextResponse.json({
      success: true,
      columns,
      rows,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save school Excel file."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
