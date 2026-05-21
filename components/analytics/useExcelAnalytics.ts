"use client"

import { useEffect, useState } from "react"

export type ExcelAnalyticsData = {
  excelFiles?: Array<{
    id: string | number
    data_type?: string | number
    name?: string
    url?: string
  }>
  schools?: {
    rowCount: number
    fieldCount: number
    files?: Array<{
      id: string | number
      data_type?: string | number
      name?: string
      url?: string
    }>
    errors?: Array<{
      file: {
        id: string | number
        data_type?: string | number
        name?: string
        url?: string
      } | null
      error: string | null
    }>
  }
  teachers?: {
    rowCount: number
    fieldCount: number
    files?: Array<{
      id: string | number
      data_type?: string | number
      name?: string
      url?: string
    }>
    errors?: Array<{
      file: {
        id: string | number
        data_type?: string | number
        name?: string
        url?: string
      } | null
      error: string | null
    }>
  }
  qle?: {
    rowCount: number
    fieldCount: number
    files?: Array<{
      id: string | number
      data_type?: string | number
      name?: string
      url?: string
    }>
    errors?: Array<{
      file: {
        id: string | number
        data_type?: string | number
        name?: string
        url?: string
      } | null
      error: string | null
    }>
  }
  classroomObservation?: {
    rowCount: number
    fieldCount: number
    files?: Array<{
      id: string | number
      data_type?: string | number
      name?: string
      url?: string
    }>
    errors?: Array<{
      file: {
        id: string | number
        data_type?: string | number
        name?: string
        url?: string
      } | null
      error: string | null
    }>
  }
  qleSummary?: {
    rowCount: number
    averagePercentage: number
    averageMos: number
    gradeCounts: Record<"A" | "B" | "C" | "D", number>
    byOrganization?: Array<{
      organization: string
      rowCount: number
      averagePercentage: number
      averageMos: number
      gradeCounts: Record<"A" | "B" | "C" | "D", number>
    }>
    columns: {
      organization?: string | null
      percentage?: string | null
      mos?: string | null
      grade?: string | null
    }
  }
  classroomObservationSummary?: {
    rowCount: number
    achieved: number
    notAchieved: number
    unknown: number
    byOrganization?: Array<{
      organization: string
      achieved: number
      notAchieved: number
      unknown: number
    }>
    columns: {
      organization?: string | null
      achieved?: string | null
      notAchieved?: string | null
      status?: string | null
    }
  }
  totals?: {
    excelFiles: number
    rows: number
    fields: number
  }
  organizations?: string[]
  charts?: {
    teacherGender?: Record<string, number>
    studentGender?: Record<string, number>
    studentsByGrade?: Record<string, number>
    teachersBySubject?: Record<string, number>
    teachersBySubjectGender?: Record<
      string,
      { total: number; male: number; female: number }
    >
    schoolType?: Record<string, number>
    curriculum?: Record<string, number>
    educationByOrganization?: Array<{
      name: string
      schools: number
      teachers: number
      students: number
    }>
  }
  error?: string
}

export type AnalyticsProgram = "be" | "eccd" | "ie"

const analyticsCache = new Map<string, ExcelAnalyticsData>()
const analyticsRequests = new Map<string, Promise<ExcelAnalyticsData>>()

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) return {} as T
  return JSON.parse(text) as T
}

function getCacheKey(
  organization: string,
  dataYearId: string,
  program: AnalyticsProgram,
) {
  return `${program}:${dataYearId}:${organization}`
}

export async function loadExcelAnalytics(
  organization = "all",
  dataYearId: string,
  program: AnalyticsProgram = "be",
) {
  const cacheKey = getCacheKey(organization, dataYearId, program)
  const cached = analyticsCache.get(cacheKey)

  if (cached) return cached

  const existingRequest = analyticsRequests.get(cacheKey)

  if (existingRequest) return existingRequest

  const request = (async () => {
    const params = new URLSearchParams({
      data_year: dataYearId,
      organization,
      program,
    })
    const analyticsResponse = await fetch(
      `/api/analytics/excel?${params.toString()}`,
    )
    const body = await parseJson<ExcelAnalyticsData>(analyticsResponse)

    if (!analyticsResponse.ok) {
      throw new Error(body.error || "Failed to load Excel analytics.")
    }

    analyticsCache.set(cacheKey, body)
    return body
  })()

  analyticsRequests.set(cacheKey, request)

  try {
    return await request
  } finally {
    analyticsRequests.delete(cacheKey)
  }
}

export function prefetchExcelAnalytics(
  dataYearId: string,
  programs: AnalyticsProgram[] = ["be", "eccd", "ie"],
) {
  programs.forEach((program) => {
    void loadExcelAnalytics("all", dataYearId, program).catch(() => {
      // Active panels surface errors; background prefetch stays quiet.
    })
  })
}

export function useExcelAnalytics(
  organization = "all",
  dataYearId?: string,
  program: AnalyticsProgram = "be",
) {
  const [data, setData] = useState<ExcelAnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!dataYearId) {
      setData(null)
      setLoading(false)
      return
    }

    const load = async () => {
      const cached = analyticsCache.get(getCacheKey(organization, dataYearId, program))

      if (cached) {
        setData(cached)
        setLoading(false)
        return
      }

      setLoading(true)
      setError("")

      try {
        const body = await loadExcelAnalytics(organization, dataYearId, program)
        setData(body)
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load Excel analytics."
        setError(message)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [organization, dataYearId, program])

  return { data, loading, error }
}
