"use client"
import React from "react"
import Link from "next/link"
import Button from "@/components/ui/button/Button"

export default function SettingsButtons() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
        Settings:
      </span>
      <Link href="/state_region">
        <Button size="sm" variant="outline">
          State/Region
        </Button>
      </Link>
      <Link href="/subjects">
        <Button size="sm" variant="outline">
          Subjects
        </Button>
      </Link>
      <Link href="/teach_types">
        <Button size="sm" variant="outline">
          Teacher Types
        </Button>
      </Link>
      <Link href="/teacher_status">
        <Button size="sm" variant="outline">
          Teacher Status
        </Button>
      </Link>
      <Link href="/techer_position">
        <Button size="sm" variant="outline">
          Teacher Positions
        </Button>
      </Link>
      <Link href="/ts_mimu">
        <Button size="sm" variant="outline">
          Townships
        </Button>
      </Link>
    </div>
  )
}
