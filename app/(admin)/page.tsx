import AnalyticsBarChart from "@/components/analytics/AnalyticsBarChart"
import StudentGenderSessionChart from "@/components/analytics/StudentGenderSessionChart"
import TeacherGenderSessionChart from "@/components/analytics/TeacherGenderSessionChart"
import StudentsByGradeChart from "@/components/analytics/StudentsByGradeChart"
import TeachersBySubjectChart from "@/components/analytics/TeachersBySubjectChart"
import TopSchoolsByEnrollment from "@/components/analytics/TopSchoolsByEnrollment"
import SchoolsByTypeAndRegion from "@/components/analytics/SchoolsByTypeAndRegion"
import TeacherStatusOverview from "@/components/analytics/TeacherStatusOverview"
import TeachersByPositionChart from "@/components/analytics/TeachersByPositionChart"
import { Metadata } from "next"
import React from "react"

export const metadata: Metadata = {
  title: "Next.js Analytics Dashboard | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Analytics Dashboard page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
}

export default function Analytics() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Key Metrics (moved to Teachers and Schools pages) */}

      {/* School Analytics */}
      <div className="col-span-12">
        <SchoolsByTypeAndRegion />
      </div>

      <div className="col-span-12">
        <TopSchoolsByEnrollment />
      </div>

      {/* Teacher Analytics */}
      <div className="col-span-12">
        <TeacherStatusOverview />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <TeachersByPositionChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <TeachersBySubjectChart />
      </div>

      {/* Gender Distribution */}
      <div className="col-span-12 xl:col-span-7">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <StudentGenderSessionChart />
          <TeacherGenderSessionChart />
        </div>
      </div>

      {/* Student Analytics */}
      <div className="col-span-12 xl:col-span-7">
        <StudentsByGradeChart />
      </div>

      {/* Overall Analytics Bar Chart */}
      <div className="col-span-12">
        <AnalyticsBarChart />
      </div>
    </div>
  )
}
