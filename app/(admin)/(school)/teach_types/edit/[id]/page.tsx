"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"

interface TeachType {
  id: string
  title: string
  title_short?: string
  title_myanmar?: string
}

export default function EditTeachType({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [item, setItem] = useState<TeachType | null>(null)
  const [title, setTitle] = useState("")
  const [titleShort, setTitleShort] = useState("")
  const [titleMyanmar, setTitleMyanmar] = useState("")

  useEffect(() => {
    // TODO: fetch by id from API; using mock for now
    const mock: TeachType = {
      id,
      title: "MoE",
      title_short: "MoE",
      title_myanmar: "အစိုးရခန့်",
    }
    setItem(mock)
    setTitle(mock.title)
    setTitleShort(mock.title_short || "")
    setTitleMyanmar(mock.title_myanmar || "")
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call update API
    alert(`Update teach type: ${title}`)
    router.push("/teach_types")
  }

  if (!item) return <div>Loading...</div>

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Teacher Type" />
      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              onClick={() => router.push("/teach_types")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
