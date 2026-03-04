"use client"
import React from "react"
import Link from "next/link"
import Button from "@/components/ui/button/Button"

export default function SettingsButtons() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
        Master Data:
      </span>
      <Link href="/master-data">
        <Button size="sm" variant="outline">
          Open Master Data
        </Button>
      </Link>
    </div>
  )
}
