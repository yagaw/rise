"use client"
import React, { useState } from "react"
import { schools } from "@/data/education"

type NewStudent = {
  id?: string
  fullName: string
  schoolId: string
  gradeLevel: string
  gender: "male" | "female"
}

const gradeLevels = [
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
]

export default function StudentsPage() {
  const [studentForm, setStudentForm] = useState<NewStudent>({
    fullName: "",
    schoolId: schools[0]?.id ?? "",
    gradeLevel: gradeLevels[0],
    gender: "male",
  })
  const [manualStudents, setManualStudents] = useState<NewStudent[]>([])
  const [editingIndex, setEditingIndex] = useState<number>(-1)

  function resetForm() {
    setStudentForm({
      fullName: "",
      schoolId: schools[0]?.id ?? "",
      gradeLevel: gradeLevels[0],
      gender: "male",
    })
    setEditingIndex(-1)
  }
  function addOrUpdate() {
    if (!studentForm.fullName.trim() || !studentForm.schoolId) return
    const payload: NewStudent = {
      ...studentForm,
      id: studentForm.id ?? `ms-${Date.now()}`,
    }
    if (editingIndex >= 0) {
      setManualStudents((prev) =>
        prev.map((s, i) => (i === editingIndex ? payload : s))
      )
    } else {
      setManualStudents((prev) => [payload, ...prev])
    }
    resetForm()
  }
  function onEdit(index: number) {
    setStudentForm(manualStudents[index])
    setEditingIndex(index)
  }
  function onDelete(index: number) {
    setManualStudents((prev) => prev.filter((_, i) => i !== index))
    if (editingIndex === index) resetForm()
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Students - Add / Edit
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <input
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              placeholder="Full name"
              value={studentForm.fullName}
              onChange={(e) =>
                setStudentForm((s) => ({ ...s, fullName: e.target.value }))
              }
            />
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              value={studentForm.schoolId}
              onChange={(e) =>
                setStudentForm((s) => ({ ...s, schoolId: e.target.value }))
              }
            >
              {schools.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              value={studentForm.gradeLevel}
              onChange={(e) =>
                setStudentForm((s) => ({ ...s, gradeLevel: e.target.value }))
              }
            >
              {gradeLevels.map((gl) => (
                <option key={gl} value={gl}>
                  {gl}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              value={studentForm.gender}
              onChange={(e) =>
                setStudentForm((s) => ({
                  ...s,
                  gender: e.target.value as "male" | "female",
                }))
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={addOrUpdate}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              {editingIndex >= 0 ? "Save" : "Add"}
            </button>
            {editingIndex >= 0 && (
              <button
                onClick={resetForm}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="mt-6 max-w-full overflow-x-auto custom-scrollbar">
            <table className="min-w-[800px] w-full text-left">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    Full name
                  </th>
                  <th className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    School
                  </th>
                  <th className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    Grade
                  </th>
                  <th className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    Gender
                  </th>
                  <th className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {manualStudents.map((s, idx) => (
                  <tr key={s.id ?? idx}>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 text-theme-sm">
                      {s.fullName}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 text-theme-sm">
                      {schools.find((x) => x.id === s.schoolId)?.name ??
                        s.schoolId}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 text-theme-sm">
                      {s.gradeLevel}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 text-theme-sm">
                      {s.gender}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 text-theme-sm">
                      <button
                        className="mr-2 underline"
                        onClick={() => onEdit(idx)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-error-600 underline"
                        onClick={() => onDelete(idx)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!manualStudents.length && (
                  <tr>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-theme-sm">
                      No manual students
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
