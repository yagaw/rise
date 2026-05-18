"use client"

import { useEffect, useState } from "react"
import type { DataYear } from "@/types/dataYear"

export type ExcelAnalyticsData = {
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
    educationByOrganization?: Array<{
      name: string
      schools: number
      teachers: number
      students: number
    }>
  }
  error?: string
}

function toId(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value)
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) return {} as T
  return JSON.parse(text) as T
}

export function useExcelAnalytics(organization = "all") {
  const [data, setData] = useState<ExcelAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")

      try {
        const dataYearResponse = await fetch("/api/data_year")

        if (!dataYearResponse.ok) {
          throw new Error("Failed to load data years.")
        }

        const dataYears = (await dataYearResponse.json()) as DataYear[]
        const dataYearId = toId(dataYears[0]?.id)

        if (!dataYearId) {
          setData(null)
          return
        }

        const params = new URLSearchParams({
          data_year: dataYearId,
          organization,
        })
        const analyticsResponse = await fetch(
          `/api/analytics/excel?${params.toString()}`,
        )
        const body = await parseJson<ExcelAnalyticsData>(analyticsResponse)

        if (!analyticsResponse.ok) {
          throw new Error(body.error || "Failed to load Excel analytics.")
        }

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
  }, [organization])

  return { data, loading, error }
}
