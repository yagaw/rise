import { NextResponse } from "next/server"
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server"

const EXCEL_BUCKET = "excel_data"
const EXCEL_TABLE = "excel_data"
const ALLOWED_EXTENSIONS = new Set([".xls", ".xlsx"])

export const runtime = "nodejs"

function normalizeDataYearId(value: string | null): string {
  if (typeof value !== "string") return ""
  return value.trim()
}

function normalizeDataTypeId(value: string | null): string {
  if (typeof value !== "string") return ""
  return value.trim()
}

function normalizeImportName(value: string | null): string {
  if (typeof value !== "string") return ""
  return value.trim()
}

function getExcelExtension(fileName: string) {
  const lowerName = fileName.toLowerCase()

  if (lowerName.endsWith(".xlsx")) return ".xlsx"
  if (lowerName.endsWith(".xls")) return ".xls"

  return ""
}

function stripExcelExtension(value: string) {
  return value.replace(/\.xlsx?$/i, "")
}

function toStorageSafeName(value: string) {
  return stripExcelExtension(value)
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function getExcelContentType(extension: string, fallback: string) {
  if (fallback) return fallback

  if (extension === ".xlsx") {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }

  return "application/vnd.ms-excel"
}

function getMetadataInsertErrorMessage(message: string) {
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes("schema cache") ||
    lowerMessage.includes("could not find") ||
    lowerMessage.includes("relation")
  ) {
    return "Failed to save Excel metadata. Make sure the excel_data table exists with data_year, data_type, name, and url columns."
  }

  return `Failed to save Excel metadata: ${message}`
}

async function handlePost(request: Request) {
  const userSupabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await userSupabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Authentication is required." },
      { status: 401 },
    )
  }

  const params = new URL(request.url).searchParams
  const importName = normalizeImportName(params.get("name"))
  const dataYearId = normalizeDataYearId(params.get("dataYearId"))
  const dataTypeId = normalizeDataTypeId(params.get("dataTypeId"))
  const fileName = normalizeImportName(params.get("fileName"))
  const fileType =
    normalizeImportName(params.get("fileType")) ||
    request.headers.get("content-type") ||
    ""

  if (!importName) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 })
  }

  if (!dataYearId) {
    return NextResponse.json({ error: "Data year is required." }, { status: 400 })
  }

  if (!dataTypeId) {
    return NextResponse.json({ error: "Data type is required." }, { status: 400 })
  }

  if (!fileName) {
    return NextResponse.json({ error: "Excel file is required." }, { status: 400 })
  }

  const extension = getExcelExtension(fileName)

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return NextResponse.json(
      { error: "Only .xlsx and .xls files can be uploaded." },
      { status: 400 },
    )
  }

  const safeName = toStorageSafeName(importName)

  if (!safeName) {
    return NextResponse.json(
      { error: "Name must contain letters or numbers." },
      { status: 400 },
    )
  }

  const supabase = createSupabaseAdminClient()
  const storagePath = `${safeName}${extension}`
  const fileBuffer = Buffer.from(await request.arrayBuffer())
  const contentType = getExcelContentType(extension, fileType)

  if (fileBuffer.length === 0) {
    return NextResponse.json({ error: "Excel file is empty." }, { status: 400 })
  }

  const { error: uploadError } = await supabase.storage
    .from(EXCEL_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json(
      { error: `Failed to upload Excel file: ${uploadError.message}` },
      { status: 500 },
    )
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(EXCEL_BUCKET).getPublicUrl(storagePath)

  const { data, error: insertError } = await supabase
    .from(EXCEL_TABLE)
    .insert({
      data_year: dataYearId,
      data_type: dataTypeId,
      name: importName,
      url: publicUrl,
    })
    .select("*")
    .single()

  if (insertError) {
    await supabase.storage.from(EXCEL_BUCKET).remove([storagePath])

    return NextResponse.json(
      { error: getMetadataInsertErrorMessage(insertError.message) },
      { status: 500 },
    )
  }

  return NextResponse.json({ data, url: publicUrl }, { status: 201 })
}

export async function POST(request: Request) {
  try {
    return await handlePost(request)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to import Excel file."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
