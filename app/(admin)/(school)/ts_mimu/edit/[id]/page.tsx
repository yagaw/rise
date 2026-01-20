"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"

interface TsMimu {
  id: string
  title_english: string
  title_myanmar?: string
}

export default function EditTsMimu({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [item, setItem] = useState<TsMimu | null>(null)
  const [titleEnglish, setTitleEnglish] = useState("")
  const [titleMyanmar, setTitleMyanmar] = useState("")

  useEffect(() => {
    // TODO: fetch by id from API, using mock for now
    const mock: TsMimu = { id, title_english: "Falam", title_myanmar: "ဖလမ်း" }
    setItem(mock)
    setTitleEnglish(mock.title_english)
    setTitleMyanmar(mock.title_myanmar || "")
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call update API
    alert(`Update: ${titleEnglish}`)
    router.push("/ts_mimu")
  }

  if (!item) return <div>Loading...</div>

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Township (ts_mimu)" />
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
            <Button variant="outline" onClick={() => router.push("/ts_mimu")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
