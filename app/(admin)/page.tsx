import { Metadata } from "next"
import React from "react"

export const metadata: Metadata = {
  title: "Welcome to RISE Database",
  description: "RISE education database home",
}

export default function HomePage() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
          RISE Database
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-800 dark:text-white/90">
          Welcome to RISE Database
        </h1>
        <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
          Use the sidebar to open the analysis dashboard, manage school and
          teacher Excel data, or import new files into the database.
        </p>
      </div>
    </div>
  )
}
