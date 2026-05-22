import PageBreadcrumb from "@/components/common/PageBreadCrumb"

export default function WomenLiteracyPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Women Literacy Students" />

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Women Literacy Students
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Women Literacy student records will be managed here.
        </p>
      </div>
    </div>
  )
}
