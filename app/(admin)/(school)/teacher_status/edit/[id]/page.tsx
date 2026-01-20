"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"

interface TeacherStatus {
  id: string
  title_english: string
  title_short?: string
  title_myanmar?: string
}

export default function EditTeacherStatus({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { id } = params
  const [item, setItem] = useState<TeacherStatus | null>(null)
  const [titleEnglish, setTitleEnglish] = useState("")
  const [titleShort, setTitleShort] = useState("")
  const [titleMyanmar, setTitleMyanmar] = useState("")

  useEffect(() => {
    // TODO: fetch by id from API — using mock for now
    const mock: TeacherStatus = {
      id,
      title_english: "Stay",
      title_short: "S",
      title_myanmar:
        "စာဆက်သင်သည် (မနှစ်ရော ယခုနှစ်ရော ယခုကျောင်းမှာပဲ စာဆက်သင်သည်။)",
    }
    setItem(mock)
    setTitleEnglish(mock.title_english)
    setTitleShort(mock.title_short || "")
    setTitleMyanmar(mock.title_myanmar || "")
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call update API
    alert(`Update teacher status: ${titleEnglish}`)
    router.push("/teacher_status")
  }

  if (!item) return <div>Loading...</div>

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Teacher Status" />
      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title (English)
            </label>
            <input
              value={titleEnglish}
              onChange={(e) => setTitleEnglish(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Short
            </label>
            <input
              value={titleShort}
              onChange={(e) => setTitleShort(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title (Myanmar)
            </label>
            <input
              value={titleMyanmar}
              onChange={(e) => setTitleMyanmar(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit">Save</Button>
            <Button
              variant="outline"
              onClick={() => router.push("/teacher_status")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
