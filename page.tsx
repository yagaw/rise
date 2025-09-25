import { schools, students, teachers } from "@/data/education"
import type { School, Student, Teacher } from "@/data/education"

async function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  // Using static data from /data/education.ts

  const totalSchools = schools.length
  const totalTeachers = teachers.length
  const totalStudents = students.length

  const schoolStats = schools.map((school) => {
    return {
      ...school,
      teacherCount: teachers.filter((t: Teacher) => t.schoolId === school.id)
        .length,
      studentCount: students.filter((s: Student) => s.schoolId === school.id)
        .length,
      address: `${school.name} Campus`, // Mock address since our data doesn't have it
    }
  })

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Analytics Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Schools" value={totalSchools} />
        <StatCard title="Total Teachers" value={totalTeachers} />
        <StatCard title="Total Students" value={totalStudents} />
      </div>

      {/* Per School Breakdown */}
      <div>
        <h2 className="text-2xl font-bold mb-4">School Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left">School Name</th>
                <th className="py-3 px-4 text-left">Address</th>
                <th className="py-3 px-4 text-left">Teachers</th>
                <th className="py-3 px-4 text-left">Students</th>
              </tr>
            </thead>
            <tbody>
              {schoolStats.map((school) => (
                <tr key={school.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{school.name}</td>
                  <td className="py-3 px-4">{school.address}</td>
                  <td className="py-3 px-4">{school.teacherCount}</td>
                  <td className="py-3 px-4">{school.studentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
