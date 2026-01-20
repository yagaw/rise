"use client"
import React, { useState } from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"

export default function AddStateRegion() {
  const [titleEnglish, setTitleEnglish] = useState("")
  const [titleMyanmar, setTitleMyanmar] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call API to create state/region
    alert(`Create state/region: ${titleEnglish}`)
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Add State / Region" />
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
            <Button type="submit">Create</Button>
            <Button
              variant="outline"
              onClick={() => {
                setTitleEnglish("")
                setTitleMyanmar("")
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
