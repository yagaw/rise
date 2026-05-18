import { NextResponse } from "next/server"
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server"

const EXCEL_BUCKET = "excel_data"
const EXCEL_TABLE = "excel_data"
const ALLOWED_EXTENSIONS = new Set([".xls", ".xlsx"])

export const runtime = "nodejs"

function normalize(value: string | null) {
  return typeof value === "string" ? value.trim() : ""
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

function getStoragePathFromUrl(url: string | null | undefined) {
  if (!url) return null

  const marker = `/storage/v1/object/public/${EXCEL_BUCKET}/`
  const markerIndex = url.indexOf(marker)

  if (markerIndex === -1) {
    return null
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length))
}

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return Boolean(user)
}

async function getExcelRecord(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  id: string,
) {
  const { data, error } = await supabase
    .from(EXCEL_TABLE)
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(`Failed to find Excel data: ${error.message}`)
  }

  return data as {
    id: string | number
    name?: string
    url?: string
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireUser())) {
    return NextResponse.json(
      { error: "Authentication is required." },
      { status: 401 },
    )
  }

  const { id } = await params
  const body = (await request.json()) as {
    name?: unknown
    data_year?: unknown
    data_type?: unknown
  }
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const dataYear =
    body.data_year === null || body.data_year === undefined
      ? ""
      : String(body.data_year).trim()
  const dataType =
    body.data_type === null || body.data_type === undefined
      ? ""
      : String(body.data_type).trim()

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 })
  }

  if (!dataYear) {
    return NextResponse.json({ error: "Data year is required." }, { status: 400 })
  }

  if (!dataType) {
    return NextResponse.json({ error: "Data type is required." }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from(EXCEL_TABLE)
    .update({
      name,
      data_year: dataYear,
      data_type: dataType,
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json(
      { error: `Failed to update Excel data: ${error.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json(data)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireUser())) {
    return NextResponse.json(
      { error: "Authentication is required." },
      { status: 401 },
    )
  }

  const { id } = await params
  const searchParams = new URL(request.url).searchParams
  const fileName = normalize(searchParams.get("fileName"))
  const fileType =
    normalize(searchParams.get("fileType")) ||
    request.headers.get("content-type") ||
    ""
  const nextName = normalize(searchParams.get("name"))

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

  const supabase = createSupabaseAdminClient()

  try {
    const record = await getExcelRecord(supabase, id)
    const uploadName = nextName || record.name || stripExcelExtension(fileName)
    const safeName = toStorageSafeName(uploadName)

    if (!safeName) {
      return NextResponse.json(
        { error: "Name must contain letters or numbers." },
        { status: 400 },
      )
    }

    const fileBuffer = Buffer.from(await request.arrayBuffer())

    if (fileBuffer.length === 0) {
      return NextResponse.json({ error: "Excel file is empty." }, { status: 400 })
    }

    const storagePath = `${safeName}${extension}`
    const oldStoragePath = getStoragePathFromUrl(record.url)
    const contentType = getExcelContentType(extension, fileType)
    const { error: uploadError } = await supabase.storage
      .from(EXCEL_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Failed to upload Excel file: ${uploadError.message}`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(EXCEL_BUCKET).getPublicUrl(storagePath)
    const { data, error: updateError } = await supabase
      .from(EXCEL_TABLE)
      .update({
        name: uploadName,
        url: publicUrl,
      })
      .eq("id", id)
      .select("*")
      .single()

    if (updateError) {
      throw new Error(`Failed to update Excel data: ${updateError.message}`)
    }

    if (oldStoragePath && oldStoragePath !== storagePath) {
      await supabase.storage.from(EXCEL_BUCKET).remove([oldStoragePath])
    }

    return NextResponse.json(data)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to replace Excel file."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
