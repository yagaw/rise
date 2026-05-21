"use client"

import React, { useEffect, useMemo, useState } from "react"
import AnalyticsBarChart from "./AnalyticsBarChart"
import EducationAnalyticsDashboard from "./EducationAnalyticsDashboard"
import StudentGenderSessionChart from "./StudentGenderSessionChart"
import TeacherGenderSessionChart from "./TeacherGenderSessionChart"
import StudentsByGradeChart from "./StudentsByGradeChart"
import TeachersBySubjectChart from "./TeachersBySubjectChart"
import SchoolTypeChart from "./SchoolTypeChart"
import CurriculumChart from "./CurriculumChart"
import SchoolsByOrganizationDonut from "./SchoolsByOrganizationDonut"
import ClassroomObservationDonut from "./ClassroomObservationDonut"
import {
  prefetchExcelAnalytics,
  useExcelAnalytics,
  type AnalyticsProgram,
} from "./useExcelAnalytics"
import type { DataYear } from "@/types/dataYear"

type DashboardTab = "BE" | "ECCD" | "IE"

const dashboardTabs: DashboardTab[] = ["BE", "ECCD", "IE"]

function toId(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value)
}

export default function DashboardContent() {
  const [dataYears, setDataYears] = useState<DataYear[]>([])
  const [selectedDataYear, setSelectedDataYear] = useState("")
  const [activeTab, setActiveTab] = useState<DashboardTab>("BE")
  const [organization, setOrganization] = useState("all")
  const [loadingYears, setLoadingYears] = useState(true)
  const activeProgram = activeTab.toLowerCase() as AnalyticsProgram

  useEffect(() => {
    const loadDataYears = async () => {
      try {
        const response = await fetch("/api/data_year")
        if (!response.ok) throw new Error("Failed to load data years.")
        const rows = (await response.json()) as DataYear[]
        setDataYears(rows)
      } catch {
        // silently fail — user can retry by refreshing
      } finally {
        setLoadingYears(false)
      }
    }
    loadDataYears()
  }, [])

  useEffect(() => {
    if (!selectedDataYear) return
    prefetchExcelAnalytics(selectedDataYear)
  }, [selectedDataYear])

  useEffect(() => {
    setOrganization("all")
  }, [activeTab, selectedDataYear])

  const { data: analyticsData } = useExcelAnalytics(
    "all",
    selectedDataYear || undefined,
    activeProgram,
  )
  const organizations = analyticsData?.organizations ?? []

  const selectedDataYearLabel = useMemo(() => {
    const found = dataYears.find(
      (dataYear) => toId(dataYear.id) === selectedDataYear,
    )
    return found?.title || selectedDataYear || "No data year"
  }, [dataYears, selectedDataYear])

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Data Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {activeTab} analysis metrics
              {selectedDataYear && (
                <> &middot; {selectedDataYearLabel}</>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              {dashboardTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`h-9 rounded-md px-4 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <select
              id="dashboardDataYear"
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-theme-xs transition-colors focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-brand-800"
              value={selectedDataYear}
              onChange={(e) => setSelectedDataYear(e.target.value)}
              disabled={loadingYears}
            >
              <option value="">
                {loadingYears ? "Loading..." : "Select data year"}
              </option>
              {dataYears.map((dy) => (
                <option key={toId(dy.id)} value={toId(dy.id)}>
                  {dy.title || toId(dy.id)}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-theme-xs transition-colors focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-brand-800"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              disabled={!selectedDataYear}
            >
              <option value="all">All Organizations</option>
              {organizations.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <EducationAnalyticsDashboard
        selectedDataYear={selectedDataYear}
        dataYears={dataYears}
        program={activeProgram}
        programLabel={activeTab}
        organization={organization}
        onOrganizationChange={setOrganization}
      />

      <div
        className="col-span-12 animate-card-enter"
        style={{ animationDelay: "100ms" }}
      >
        <AnalyticsBarChart
          dataYearId={selectedDataYear || undefined}
          program={activeProgram}
          organization={organization}
          onOrganizationChange={setOrganization}
          organizations={organizations}
        />
      </div>

      <div
        className="col-span-12 md:col-span-6 xl:col-span-4 animate-card-enter"
        style={{ animationDelay: "200ms" }}
      >
        <StudentGenderSessionChart
          dataYearId={selectedDataYear || undefined}
          program={activeProgram}
          organization={organization}
        />
      </div>

      <div
        className="col-span-12 md:col-span-6 xl:col-span-4 animate-card-enter"
        style={{ animationDelay: "225ms" }}
      >
        <TeacherGenderSessionChart
          dataYearId={selectedDataYear || undefined}
          program={activeProgram}
          organization={organization}
        />
      </div>

      <div
        className="col-span-12 xl:col-span-4 animate-card-enter"
        style={{ animationDelay: "250ms" }}
      >
        <TeachersBySubjectChart
          dataYearId={selectedDataYear || undefined}
          program={activeProgram}
          organization={organization}
        />
      </div>

      <div
        className="col-span-12 xl:col-span-6 animate-card-enter"
        style={{ animationDelay: "275ms" }}
      >
        <SchoolsByOrganizationDonut
          dataYearId={selectedDataYear || undefined}
          program={activeProgram}
          programLabel={activeTab}
          organization={organization}
        />
      </div>

      <div
        className="col-span-12 xl:col-span-6 animate-card-enter"
        style={{ animationDelay: "300ms" }}
      >
        <CurriculumChart
          dataYearId={selectedDataYear || undefined}
          program={activeProgram}
          organization={organization}
        />
      </div>

      <div
        className="col-span-12 xl:col-span-4 animate-card-enter"
        style={{ animationDelay: "325ms" }}
      >
        <SchoolTypeChart
          dataYearId={selectedDataYear || undefined}
          program={activeProgram}
          organization={organization}
        />
      </div>

      <div
        className="col-span-12 xl:col-span-4 animate-card-enter"
        style={{ animationDelay: "350ms" }}
      >
        <ClassroomObservationDonut
          dataYearId={selectedDataYear || undefined}
          program={activeProgram}
          programLabel={activeTab}
          organization={organization}
          organizations={organizations}
          onOrganizationChange={setOrganization}
        />
      </div>

      <div
        className="col-span-12 xl:col-span-4 animate-card-enter"
        style={{ animationDelay: "375ms" }}
      >
        <StudentsByGradeChart
          dataYearId={selectedDataYear || undefined}
          program={activeProgram}
          organization={organization}
        />
      </div>
    </div>
  )
}
