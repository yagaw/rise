"use client"
import React, { useState } from "react"
import { schools } from "@/data/education"

type NewTeacher = {
  id?: string
  fullName: string
  schoolId: string
  subject: string
  gender: "male" | "female"
}

const subjects = ["Math", "Science", "English", "History", "Biology"]

export default function TeachersPage() {
  const [teacherForm, setTeacherForm] = useState<NewTeacher>({
    fullName: "",
    schoolId: schools[0]?.id ?? "",
    subject: subjects[0],
    gender: "female",
  })
  const [manualTeachers, setManualTeachers] = useState<NewTeacher[]>([])
  const [editingIndex, setEditingIndex] = useState<number>(-1)

  function resetForm() {
    setTeacherForm({
      fullName: "",
      schoolId: schools[0]?.id ?? "",
      subject: subjects[0],
      gender: "female",
    })
    setEditingIndex(-1)
  }
  function addOrUpdate() {
    if (!teacherForm.fullName.trim() || !teacherForm.schoolId) return
    const payload: NewTeacher = {
      ...teacherForm,
      id: teacherForm.id ?? `mt-${Date.now()}`,
    }
    if (editingIndex >= 0) {
      setManualTeachers((prev) =>
        prev.map((t, i) => (i === editingIndex ? payload : t))
      )
    } else {
      setManualTeachers((prev) => [payload, ...prev])
    }
    resetForm()
  }
  function onEdit(index: number) {
    setTeacherForm(manualTeachers[index])
    setEditingIndex(index)
  }
  function onDelete(index: number) {
    setManualTeachers((prev) => prev.filter((_, i) => i !== index))
    if (editingIndex === index) resetForm()
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Teachers - Add / Edit
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <input
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              placeholder="Full name"
              value={teacherForm.fullName}
              onChange={(e) =>
                setTeacherForm((t) => ({ ...t, fullName: e.target.value }))
              }
            />
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              value={teacherForm.schoolId}
              onChange={(e) =>
                setTeacherForm((t) => ({ ...t, schoolId: e.target.value }))
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
              value={teacherForm.subject}
              onChange={(e) =>
                setTeacherForm((t) => ({ ...t, subject: e.target.value }))
              }
            >
              {subjects.map((sbj) => (
                <option key={sbj} value={sbj}>
                  {sbj}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              value={teacherForm.gender}
              onChange={(e) =>
                setTeacherForm((t) => ({
                  ...t,
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
                    Subject
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
                {manualTeachers.map((t, idx) => (
                  <tr key={t.id ?? idx}>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 text-theme-sm">
                      {t.fullName}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 text-theme-sm">
                      {schools.find((x) => x.id === t.schoolId)?.name ??
                        t.schoolId}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 text-theme-sm">
                      {t.subject}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 text-theme-sm">
                      {t.gender}
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
                {!manualTeachers.length && (
                  <tr>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-theme-sm">
                      No manual teachers
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
