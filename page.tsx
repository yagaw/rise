import { schools, students, teachers } from "@/data/education"
import type { Student } from "@/data/education"
import type { School } from "@/types/school"
import type { Teacher } from "@/types/teacher"

function StatCard({
  title,
  value,
  icon,
  gradient,
  iconColor,
}: {
  title: string
  value: number
  icon: React.ReactNode
  gradient: string
  iconColor: string
}) {
  return (
    <div
      className={`hover-lift animate-card-enter rounded-2xl border border-gray-200 p-6 dark:border-gray-800 ${gradient}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColor}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-800 dark:text-white/90">
        {value.toLocaleString()}
      </p>
    </div>
  )
}

export default function AnalyticsPage() {
  const totalSchools = schools.length
  const totalTeachers = teachers.length
  const totalStudents = students.length

  const schoolStats = schools.map((school) => {
    return {
      ...school,
      teacherCount: teachers.filter(
        (t: Teacher) => t.sch_code === school.sch_code,
      ).length,
      studentCount: students.filter((s: Student) => s.schoolId === school.id)
        .length,
      address: `${school.sch_name_eng ?? school.sch_name_bur ?? school.sch_code} Campus`,
    }
  })

  return (
    <div className="animate-page-enter p-4 md:p-6 min-h-screen max-w-(--breakpoint-2xl) mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Analytics Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          A snapshot of your education management system
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 mb-8">
        <StatCard
          title="Total Schools"
          value={totalSchools}
          gradient="stat-gradient-blue"
          iconColor="bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Teachers"
          value={totalTeachers}
          gradient="stat-gradient-green"
          iconColor="bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400"
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Students"
          value={totalStudents}
          gradient="stat-gradient-orange"
          iconColor="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
          }
        />
      </div>

      {/* Per School Breakdown */}
      <div
        className="animate-card-enter rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
        style={{ animationDelay: "200ms" }}
      >
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            School Breakdown
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Per-school teacher and student distribution
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  School Name
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Address
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Teachers
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Students
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {schoolStats.map((school) => (
                <tr
                  key={school.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {school.sch_name_eng ??
                      school.sch_name_bur ??
                      school.sch_code}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {school.address}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-400">
                      {school.teacherCount}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="inline-flex items-center rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-700 dark:bg-success-900/20 dark:text-success-400">
                      {school.studentCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
