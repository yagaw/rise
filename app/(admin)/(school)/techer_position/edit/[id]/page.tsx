"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"

interface Position {
  id: string
  type_english: string
  type_short?: string
  type_myanmar?: string
}

export default function EditTecherPosition({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { id } = params
  const [item, setItem] = useState<Position | null>(null)
  const [typeEnglish, setTypeEnglish] = useState("")
  const [typeShort, setTypeShort] = useState("")
  const [typeMyanmar, setTypeMyanmar] = useState("")

  useEffect(() => {
    // TODO: fetch item by id from API — using mock
    const mock: Position = {
      id,
      type_english: "Primary Assistant Teacher (PAT)",
      type_short: "PAT",
      type_myanmar: "မူလတန်းပြဆရာ၊မ (PAT)",
    }
    setItem(mock)
    setTypeEnglish(mock.type_english)
    setTypeShort(mock.type_short || "")
    setTypeMyanmar(mock.type_myanmar || "")
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call update API
    alert(`Update position: ${typeEnglish}`)
    router.push("/techer_position")
  }

  if (!item) return <div>Loading...</div>

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Teacher Position" />
      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type (English)
            </label>
            <input
              value={typeEnglish}
              onChange={(e) => setTypeEnglish(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Short
            </label>
            <input
              value={typeShort}
              onChange={(e) => setTypeShort(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type (Myanmar)
            </label>
            <input
              value={typeMyanmar}
              onChange={(e) => setTypeMyanmar(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit">Save</Button>
            <Button
              variant="outline"
              onClick={() => router.push("/techer_position")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
