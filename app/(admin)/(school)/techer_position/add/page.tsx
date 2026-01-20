"use client"
import React, { useState } from "react"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"

export default function AddTecherPosition() {
  const [typeEnglish, setTypeEnglish] = useState("")
  const [typeShort, setTypeShort] = useState("")
  const [typeMyanmar, setTypeMyanmar] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call API to create position
    alert(`Create position: ${typeEnglish}`)
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Teacher Position" />
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
            <Button type="submit">Create</Button>
            <Button
              variant="outline"
              onClick={() => {
                setTypeEnglish("")
                setTypeShort("")
                setTypeMyanmar("")
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
