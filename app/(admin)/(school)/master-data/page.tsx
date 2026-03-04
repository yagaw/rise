import Link from "next/link"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"

const masterDataLinks = [
  {
    title: "State/Region",
    description: "Manage state and region records.",
    href: "/state_region",
  },
  {
    title: "Townships",
    description: "Manage township codes and names.",
    href: "/ts_mimu",
  },
  {
    title: "Subjects",
    description: "Manage subject definitions.",
    href: "/subjects",
  },
  {
    title: "Teacher Types",
    description: "Manage teacher type options.",
    href: "/teach_types",
  },
  {
    title: "Teacher Status",
    description: "Manage teacher status options.",
    href: "/teacher_status",
  },
  {
    title: "Teacher Positions",
    description: "Manage teacher position options.",
    href: "/techer_position",
  },
  {
    title: "Data Year",
    description: "Manage data year records.",
    href: "/data_year",
  },
]

export default function MasterDataPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Master Data" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {masterDataLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
          >
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
