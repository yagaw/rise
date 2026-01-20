"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"

interface StateRegion {
  id: string
  title_english: string
  title_myanmar?: string
}

export default function EditStateRegion({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { id } = params
  const [item, setItem] = useState<StateRegion | null>(null)
  const [titleEnglish, setTitleEnglish] = useState("")
  const [titleMyanmar, setTitleMyanmar] = useState("")

  useEffect(() => {
    // TODO: fetch by id from API — using mock for now
    const mock: StateRegion = {
      id,
      title_english: "Chin",
      title_myanmar: "ချင်းပြည်နယ်",
    }
    setItem(mock)
    setTitleEnglish(mock.title_english)
    setTitleMyanmar(mock.title_myanmar || "")
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call update API
    alert(`Update state/region: ${titleEnglish}`)
    router.push("/state_region")
  }

  if (!item) return <div>Loading...</div>

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit State / Region" />
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
            <Button
              variant="outline"
              onClick={() => router.push("/state_region")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
