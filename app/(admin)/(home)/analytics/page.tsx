// removed unused imports
import AnalyticsBarChart from "@/components/analytics/AnalyticsBarChart"
import EducationAnalyticsDashboard from "@/components/analytics/EducationAnalyticsDashboard"
import StudentGenderSessionChart from "@/components/analytics/StudentGenderSessionChart"
import TeacherGenderSessionChart from "@/components/analytics/TeacherGenderSessionChart"
import StudentsByGradeChart from "@/components/analytics/StudentsByGradeChart"
import TeachersBySubjectChart from "@/components/analytics/TeachersBySubjectChart"
import TopSchoolsByEnrollment from "@/components/analytics/TopSchoolsByEnrollment"
import { Metadata } from "next"
import React from "react"

export const metadata: Metadata = {
  title: "Analytics Dashboard | RISE Education Management",
  description:
    "Education analytics dashboard - Schools, Teachers, Students overview",
}

export default function Analytics() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <EducationAnalyticsDashboard />

      <div
        className="col-span-12 animate-card-enter"
        style={{ animationDelay: "100ms" }}
      >
        <AnalyticsBarChart />
      </div>

      <div
        className="col-span-12 xl:col-span-7 animate-card-enter"
        style={{ animationDelay: "200ms" }}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <StudentGenderSessionChart />
          <TeacherGenderSessionChart />
        </div>
      </div>

      <div
        className="col-span-12 xl:col-span-7 animate-card-enter"
        style={{ animationDelay: "300ms" }}
      >
        <StudentsByGradeChart />
      </div>
      <div
        className="col-span-12 xl:col-span-5 animate-card-enter"
        style={{ animationDelay: "350ms" }}
      >
        <TeachersBySubjectChart />
      </div>

      <div
        className="col-span-12 animate-card-enter"
        style={{ animationDelay: "400ms" }}
      >
        <TopSchoolsByEnrollment />
      </div>
    </div>
  )
}
