"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import Button from "@/components/ui/button/Button"

export default function AddTecherPosition() {
  const router = useRouter()
  const [typeEnglish, setTypeEnglish] = useState("")
  const [typeShort, setTypeShort] = useState("")
  const [typeMyanmar, setTypeMyanmar] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!typeEnglish.trim()) {
      alert("Type (English) is required.")
      return
    }
    setSaving(true)
    try {
      const response = await fetch("/api/techer_position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_english: typeEnglish,
          type_short: typeShort,
          type_myanmar: typeMyanmar,
        }),
      })
      if (!response.ok) {
        const err = (await response.json()) as { error?: string }
        throw new Error(err.error || "Failed to create")
      }
      router.push("/techer_position")
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Failed to create Teacher Position")
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Teacher Position" />
      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type (English) <span className="text-error-500">*</span>
            </label>
            <input
              value={typeEnglish}
              onChange={(e) => setTypeEnglish(e.target.value)}
              placeholder="e.g. Primary Assistant Teacher (PAT)"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Short
            </label>
            <input
              value={typeShort}
              onChange={(e) => setTypeShort(e.target.value)}
              placeholder="e.g. PAT"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type (Myanmar)
            </label>
            <input
              value={typeMyanmar}
              onChange={(e) => setTypeMyanmar(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/techer_position")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
