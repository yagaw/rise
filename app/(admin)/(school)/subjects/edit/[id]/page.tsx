"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"

interface Subject {
  id: string
  title_english: string
  title_short?: string
  title_myanmar?: string
}

export default function EditSubject({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [subject, setSubject] = useState<Subject | null>(null)
  const [titleEnglish, setTitleEnglish] = useState("")
  const [titleShort, setTitleShort] = useState("")
  const [titleMyanmar, setTitleMyanmar] = useState("")

  useEffect(() => {
    // TODO: fetch subject by id from API. Using mock for now.
    const mock: Subject = {
      id,
      title_english: "Mock Subject",
      title_short: "MS",
      title_myanmar: "မ mock",
    }
    setSubject(mock)
    setTitleEnglish(mock.title_english)
    setTitleShort(mock.title_short || "")
    setTitleMyanmar(mock.title_myanmar || "")
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call update API
    alert(`Update subject: ${titleEnglish}`)
    router.push("/subjects")
  }

  if (!subject) return <div>Loading...</div>

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Subject" />
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
            <Button variant="outline" onClick={() => router.push("/subjects")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
