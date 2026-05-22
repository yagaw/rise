"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import AnalyticsBarChart from "./AnalyticsBarChart"
import EducationAnalyticsDashboard from "./EducationAnalyticsDashboard"
import StudentGenderSessionChart from "./StudentGenderSessionChart"
import StudentProgramGenderChart from "./StudentProgramGenderChart"
import StudentSourceBreakdown from "./StudentSourceBreakdown"
import TeacherGenderSessionChart from "./TeacherGenderSessionChart"
import StudentsByGradeChart from "./StudentsByGradeChart"
import TeachersBySubjectChart from "./TeachersBySubjectChart"
import SchoolTypeChart from "./SchoolTypeChart"
import CurriculumChart from "./CurriculumChart"
import SchoolsByOrganizationDonut from "./SchoolsByOrganizationDonut"
import ClassroomObservationDonut from "./ClassroomObservationDonut"
import {
  exportDashboardImage,
  exportDashboardPdf,
} from "./exportDashboardVisual"
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
  const [exportingDashboard, setExportingDashboard] = useState<
    "image" | "pdf" | ""
  >("")
  const [exportError, setExportError] = useState("")
  const [showExportMenu, setShowExportMenu] = useState(false)
  const dashboardExportRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (!showExportMenu) return
    const handleClickOutside = () => setShowExportMenu(false)
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [showExportMenu])

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

  const handleExportDashboard = async (format: "image" | "pdf") => {
    if (!selectedDataYear) {
      setExportError("Select a data year before exporting.")
      return
    }

    setExportingDashboard(format)
    setExportError("")

    try {
      const exportOptions = {
        program: activeProgram,
        programLabel: activeTab,
        dataYearLabel: selectedDataYearLabel,
        dataYearId: selectedDataYear,
        organization,
        dashboardElement: dashboardExportRef.current,
      }

      if (format === "pdf") {
        await exportDashboardPdf(exportOptions)
      } else {
        await exportDashboardImage(exportOptions)
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to export dashboard."
      setExportError(message)
    } finally {
      setExportingDashboard("")
    }
  }

  return (
    <div ref={dashboardExportRef} className="grid grid-cols-12 gap-4 md:gap-6">
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
            <div className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowExportMenu((v) => !v) }}
                disabled={!selectedDataYear || Boolean(exportingDashboard)}
                data-export-exclude="true"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {exportingDashboard ? "Exporting..." : "Export"}
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 z-50 mt-2 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-theme-lg dark:border-gray-700 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => { setShowExportMenu(false); handleExportDashboard("image") }}
                    disabled={Boolean(exportingDashboard)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                    Export Image
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowExportMenu(false); handleExportDashboard("pdf") }}
                    disabled={Boolean(exportingDashboard)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {exportError && (
          <p className="mt-3 text-sm text-error-600 dark:text-error-400">
            {exportError}
          </p>
        )}
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

      {activeTab !== "BE" && (
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
      )}

      {activeTab === "BE" && (
        <>
          <div
            className="col-span-12 md:col-span-6 xl:col-span-4 animate-card-enter"
            style={{ animationDelay: "200ms" }}
          >
            <StudentProgramGenderChart
              dataYearId={selectedDataYear || undefined}
              organization={organization}
              sourceId="15"
              title="Students NFE by Gender"
            />
          </div>

          <div
            className="col-span-12 md:col-span-6 xl:col-span-4 animate-card-enter"
            style={{ animationDelay: "215ms" }}
          >
            <StudentProgramGenderChart
              dataYearId={selectedDataYear || undefined}
              organization={organization}
              sourceId="16"
              title="Students TEES by Gender"
            />
          </div>

          <div
            className="col-span-12 md:col-span-6 xl:col-span-4 animate-card-enter"
            style={{ animationDelay: "220ms" }}
          >
            <StudentProgramGenderChart
              dataYearId={selectedDataYear || undefined}
              organization={organization}
              sourceId="17"
              title="Students Women Literacy by Gender"
            />
          </div>

          <div
            className="col-span-12 md:col-span-6 xl:col-span-4 animate-card-enter"
            style={{ animationDelay: "225ms" }}
          >
            <StudentSourceBreakdown
              dataYearId={selectedDataYear || undefined}
              organization={organization}
            />
          </div>
        </>
      )}

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
